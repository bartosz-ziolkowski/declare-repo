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
					`/home/ubuntu/declare4py_project/venv/bin/python3 ltlf_checker.py --model "${modelPath}" --json-output`,
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
	const delayBetweenAttempts = 6000; // 6 seconds
	let attempts = 0;

	const complexResponse = {
		success: false,
		message: "Too complex to compute",
	};

	const badResponse = { success: false };

	while (attempts < maxAttempts) {
		try {
			const command = new GetCommandInvocationCommand({
				CommandId: commandId,
				InstanceId: instanceId,
			});

			const response = await client.send(command);
			switch (response.Status) {
				case "Success":
					return response.StandardOutputContent;
				case "Failed":
					return badResponse;
				case "InProgress":
				case "Pending":
					// Continue waiting
					break;
				default:
					return badResponse;
			}
		} catch (error) {
			if (
				error.$metadata?.httpStatusCode === 400 &&
				error.__type === "InvocationDoesNotExist"
			) {
				attempts++;
				if (attempts >= maxAttempts) {
					return complexResponse;
				}
				await new Promise((resolve) =>
					setTimeout(resolve, delayBetweenAttempts),
				);
				continue;
			}
			throw error;
		}

		attempts++;
		await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
	}

	return complexResponse;
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

	// Handle empty responses
	if (!response) {
		standardResponse.message = "Empty response received";
		return standardResponse;
	}

	// Handle complex response case
	if (response.message === "Too complex to compute") {
		standardResponse.message = "Computing timed out";
		return standardResponse;
	}

	// Handle error responses
	if (response.success === false) {
		standardResponse.message = response.error || "Command execution failed";
		return standardResponse;
	}

	try {
		const outputContent = response.result;

		if (!outputContent || typeof outputContent !== "string") {
			// Handle invalid output content
			standardResponse.message = "Invalid output format";
			return standardResponse;
		}

		if (outputContent.trim().startsWith("{")) {
			// Try parsing JSON output
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
}
