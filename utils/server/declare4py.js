import {
	GetCommandInvocationCommand,
	SSMClient,
	SendCommandCommand,
} from "@aws-sdk/client-ssm";

async function runPythonCommand(modelPath) {
	const client = new SSMClient({
		region: process.env.AWS_BUCKET_REGION,
		credentials: {
			accessKeyId: process.env.MY_AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		},
	});

	try {
		const command = new SendCommandCommand({
			InstanceIds: [process.env.EC2_SEC_INSTANCE_ID],
			DocumentName: "AWS-RunShellScript",
			Parameters: {
				commands: [
					"#!/bin/bash",
					"cd /home/ubuntu/declare4py_project",
					`timeout 30s /home/ubuntu/declare4py_project/venv/bin/python3 ltlf_checker.py --model "${modelPath}" --json-output`,
				],
			},
		});

		const response = await client.send(command);
		await new Promise((resolve) => setTimeout(resolve, 5000));

		const commandId = response.Command.CommandId;
		const result = await waitForCommandCompletion(
			client,
			commandId,
			process.env.EC2_SEC_INSTANCE_ID,
		);

		return { result };
	} catch (error) {
		return {
			success: false,
			error: error.message || "An unknown error occurred",
		};
	}
}

async function waitForCommandCompletion(client, commandId, instanceId) {
	const maxAttempts = 15;
	const delayBetweenAttempts = 1000;
	let attempts = 0;

	const timeoutResponse = {
		success: false,
		message: "Computation timed out",
	};

	const badResponse = { success: false };

	const timeout = setTimeout(() => {
		return timeoutResponse;
	}, 35000);

	while (attempts < maxAttempts) {
		try {
			const command = new GetCommandInvocationCommand({
				CommandId: commandId,
				InstanceId: instanceId,
			});

			const response = await client.send(command);
			switch (response.Status) {
				case "Success":
					clearTimeout(timeout);
					return response.StandardOutputContent;
				case "Failed":
					clearTimeout(timeout);
					return badResponse;
				case "InProgress":
				case "Pending":
					break;
				default:
					clearTimeout(timeout);
					return badResponse;
			}
		} catch (error) {
			if (
				error.$metadata?.httpStatusCode === 400 &&
				error.__type === "InvocationDoesNotExist"
			) {
				attempts++;
				if (attempts >= maxAttempts) {
					clearTimeout(timeout);
					return timeoutResponse;
				}
				await new Promise((resolve) =>
					setTimeout(resolve, delayBetweenAttempts),
				);
				continue;
			}
		}

		attempts++;
		await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
	}

	clearTimeout(timeout);
	return timeoutResponse;
}

export async function verifyModelConsistencyAndRedundancy(modelPath) {
	const response = await runPythonCommand(modelPath);
	if (response) {
		return parseDeclare4Py(response);
	}
}

function parseDeclare4Py(response) {
	const standardResponse = {
		success: false,
		message: "",
		satisfiable: false,
	};

	if (!response) {
		standardResponse.message = "Empty response received";
		return standardResponse;
	}

	if (response.result?.message === "Computation timed out") {
		standardResponse.message = "Computation timed out";
		return standardResponse;
	}

	if (response.success === false) {
		standardResponse.message = response.error || "Command execution failed";
		return standardResponse;
	}

	try {
		const outputContent = response.result;

		if (!outputContent || typeof outputContent !== "string") {
			standardResponse.message = "Invalid output format";
			return standardResponse;
		}

		if (outputContent.trim().startsWith("{")) {
			const jsonResult = JSON.parse(outputContent);
			let formattedRedundancy = "";
			let redundancyCount = 0;

			if (jsonResult.redundant) {
				const fixedRedundantString = jsonResult.redundant.replace(/'/g, '"');
				const redundantArray = JSON.parse(fixedRedundantString);
				redundancyCount = redundantArray.length;
				formattedRedundancy = redundantArray
					.map(
						(item) =>
							`${item.template}[${item.activities.map((act) => `'${act}'`).join(", ")}]`,
					)
					.join(", ");
			}

			return {
				success: true,
				message: "Model verification completed",
				redundancy: formattedRedundancy,
				redundancyCount: redundancyCount,
				satisfiable: jsonResult.satisfiable || false,
			};
		}
	} catch (error) {
		standardResponse.message =
			"Failed to check consistency or semantical redundancy";
		return standardResponse;
	}

	return standardResponse;
}
