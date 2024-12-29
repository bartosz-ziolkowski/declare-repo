import { verifyModelConsistencyAndRedundancy } from "./declare4py";

export async function calculateMetrics(fileContent, modelPath) {
	const baseMetrics = {
		SO1: "N/A",
		SO2: "N/A",
	};

	if (
		!fileContent ||
		fileContent.trim() === "" ||
		!modelPath ||
		modelPath.trim() === ""
	) {
		return baseMetrics;
	}

	const lines = fileContent.split("\n");
	const activities = lines.filter((line) =>
		line.trim().startsWith("activity"),
	).length;
	const constraints = lines.filter((line) => /^[A-Z]/.test(line.trim())).length;
	const weaklyComponents = analyzeWeaklyConnectedComponents(fileContent);

	const verifyModelResult =
		await verifyModelConsistencyAndRedundancy(modelPath);
	let redundancy = { message: "", result: "", redundantCount: 0 };
	let consistency = {};

	redundancy = {
		message: verifyModelResult.message,
		result: verifyModelResult.redundancy || "",
		redundantCount: verifyModelResult.redundancyCount || 0,
	};

	const {
		redundancy: removed,
		message: msg,
		redundancyCount: count,
		...rest
	} = verifyModelResult;

	consistency = {
		message: verifyModelResult.message,
		...rest,
	};

	const metrics = {
		SN1: activities + constraints,
		SN2: Number.parseFloat(calculateDensity(weaklyComponents)),
		SN3: Number.parseFloat(calculateCV(weaklyComponents)),
		SN4: activities,
		SN5: constraints,
		SN6: Number.parseFloat(
			(weaklyComponents.totalComponents / (activities + constraints)).toFixed(
				3,
			),
		),
		BH2: consistency,
		BH1: redundancy,
		...baseMetrics,
	};
	return metrics;
}

function calculateCV(weaklyComponents) {
	function getTemplatesFromConstraints(constraints) {
		return constraints
			.map((constraint) => {
				return constraint.split("[")[0];
			})
			.filter((template) => /^[A-Z]/.test(template));
	}

	function calculateProbability(componentTemplates, template) {
		const templateCount = componentTemplates.filter(
			(t) => t === template,
		).length;
		const totalTemplates = componentTemplates.length;
		return totalTemplates > 0 ? templateCount / totalTemplates : 0;
	}

	const componentValues = weaklyComponents.components.map((component) => {
		if (component.numberOfConstraints === 0) return 0;

		const componentTemplates = getTemplatesFromConstraints(
			component.constraints,
		);
		const uniqueTemplates = [...new Set(componentTemplates)];

		let sum = 0;
		uniqueTemplates.forEach((template) => {
			const probability = calculateProbability(componentTemplates, template);
			if (probability > 0) {
				sum += (probability * Math.log(probability)) / Math.log(30);
			}
		});

		return -sum;
	});

	return Number(Math.max(...componentValues).toFixed(3));
}

function calculateDensity(analysisResult) {
	const densities = analysisResult.components.map((component) => {
		const numConstraints = component.numberOfConstraints;
		const numActivities = component.numberOfActivities;

		return numActivities > 0 ? (numConstraints / numActivities).toFixed(3) : 0;
	});

	return densities.length > 0 ? Math.max(...densities) : 0;
}

function analyzeWeaklyConnectedComponents(modelContent) {
	const lines = modelContent.split("\n").filter((line) => line.trim());

	const activities = new Set();
	const constraints = new Map();

	lines.forEach((line) => {
		if (line.startsWith("activity ")) {
			const activity = line.substring("activity ".length).trim();
			activities.add(activity);
		}
	});

	const adjacencyList = new Map();
	activities.forEach((activity) => {
		adjacencyList.set(activity, new Set());
	});

	lines.forEach((line) => {
		if (line.includes("[")) {
			const mainPart = line.split("|")[0].trim();
			const constraintMatch = mainPart.match(/(\w+)\[(.*?)\]/);

			if (constraintMatch) {
				const [fullConstraint, , activitiesStr] = constraintMatch;
				const involvedActivities = activitiesStr
					.split(",")
					.map((a) => a.trim());

				constraints.set(fullConstraint, involvedActivities);

				if (involvedActivities.length > 1) {
					involvedActivities.forEach((act1) => {
						involvedActivities.forEach((act2) => {
							if (act1 !== act2) {
								adjacencyList.get(act1).add(act2);
								adjacencyList.get(act2).add(act1);
							}
						});
					});
				}
			}
		}
	});

	const visited = new Set();
	const components = [];

	function bfs(startActivity) {
		const component = {
			activities: new Set(),
			constraints: new Set(),
		};
		const queue = [startActivity];

		while (queue.length > 0) {
			const currentActivity = queue.shift();
			if (!visited.has(currentActivity)) {
				visited.add(currentActivity);
				component.activities.add(currentActivity);

				adjacencyList.get(currentActivity).forEach((neighbor) => {
					if (!visited.has(neighbor)) {
						queue.push(neighbor);
					}
				});
			}
		}

		constraints.forEach((activities, constraintName) => {
			if (activities.some((activity) => component.activities.has(activity))) {
				component.constraints.add(constraintName);
			}
		});

		return component;
	}

	activities.forEach((activity) => {
		if (!visited.has(activity)) {
			components.push(bfs(activity));
		}
	});

	return {
		totalComponents: components.length,
		components: components.map((component, index) => ({
			componentNumber: index + 1,
			numberOfActivities: component.activities.size,
			numberOfConstraints: component.constraints.size,
			activities: Array.from(component.activities).sort(),
			constraints: Array.from(component.constraints).sort(),
		})),
	};
}

function parseConstraints(declareModel) {
	const constraints = [];
	const activities = new Set();
	const groups = new Map();
	const bindings = new Map();

	const unaryConstraints = new Set([
		"Absence",
		"Absence2",
		"Absence3",
		"Exactly1",
		"Exactly2",
		"Existence",
		"Existence2",
		"Existence3",
		"Init",
	]);

	const binaryConstraints = new Set([
		"Alternate Precedence",
		"Alternate Response",
		"Alternate Succession",
		"Chain Precedence",
		"Chain Response",
		"Chain Succession",
		"Choice",
		"Co-Existence",
		"Exclusive Choice",
		"Precedence",
		"Responded Existence",
		"Response",
		"Succession",
		"Not Chain Precedence",
		"Not Chain Response",
		"Not Chain Succession",
		"Not Co-Existence",
		"Not Precedence",
		"Not Responded Existence",
		"Not Response",
		"Not Succession",
	]);

	const lines = declareModel.split("\n").filter((line) => line.trim());

	lines.forEach((line) => {
		const trimmedLine = line.trim();

		if (trimmedLine.startsWith("activity ")) {
			const activity = trimmedLine.substring("activity ".length).trim();
			activities.add(activity);
		} else if (trimmedLine.startsWith("group:")) {
			const groupValues = trimmedLine
				.split(":")[1]
				.trim()
				.split(",")
				.map((v) => v.trim());
			groups.set("group", groupValues);
		} else if (trimmedLine.startsWith("bind ")) {
			const [_, activity, binding] = trimmedLine.match(/bind (.*?): (.*)/);
			bindings.set(activity.trim(), binding.trim());
		}
	});

	const constraintRegex = /^([^\[]+)\[(.*?)\](?:\s*\|\s*\|.*)?$/;

	lines.forEach((line) => {
		const trimmedLine = line.trim();
		const match = trimmedLine.match(constraintRegex);

		if (match) {
			const [_, constraintType, params] = match;
			const type = constraintType.trim();
			const activities = params.split(",").map((a) => a.trim());

			if (unaryConstraints.has(type) && activities.length === 1) {
				constraints.push({
					type,
					A: activities[0],
					B: null,
				});
			} else if (binaryConstraints.has(type) && activities.length === 2) {
				constraints.push({
					type,
					A: activities[0],
					B: activities[1],
				});
			} else {
				console.warn(
					`Invalid constraint type or wrong number of parameters: ${type}`,
				);
			}
		}
	});

	return {
		constraints,
		metadata: {
			activityCount: activities.size,
			constraintCount: constraints.length,
			activities: Array.from(activities),
			groups: Object.fromEntries(groups),
			bindings: Object.fromEntries(bindings),
		},
	};
}
