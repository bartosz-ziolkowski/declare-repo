export const mockMetrics = [
	{
		ID: "SN1",
		name: "Size",
		description:
			"A metric that for a declarative process model represented as a graph G is a sum of its activities and constraints",
		formula:
			"\\operatorname{Size}(D)=\\left|A\\right|+\\left|\\mathfrak{C}\\right|",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SN2",
		name: "Density",
		description:
			"The ratio of constraints to activities in a Declare model. The maximum number of constraints over the number of activities among all weakly connected components of a model D",
		formula:
			"\\operatorname{Density}(D)=\\max _{c \\in \\operatorname{Comp}(D)} \\frac{\\left|\\mathfrak{C}_{c}\\right|}{\\left|A_{c}\\right|}",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SN3",
		name: "Constraint Variability",
		description:
			"Assesses the variety of constraint types used in a model. Max. entropy over the different constraint types in the weakly connected components of a Declare model",
		formula:
			"\\operatorname{CV}(D)=\\max _{c \\in\\left\\{c^{\\prime}\\left|c^{\\prime} \\in \\operatorname{Comp}(D) \\wedge\\right| C_{c^{\\prime}} \\mid>0\\right\\}}\\left\\{-\\sum_{c_n \\in D, t \\in T_{c_n}} p(c_n, t) \\cdot \\log_{|T|}(p(c_n, t))\\right\\}",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SN4",
		name: "Number of activities",
		description: "The number of activities of a declarative model",
		formula: "\\text{Activities}(D) =\\left|A\\right|",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SN5",
		name: "Number of constraints",
		description: "The number of constraints of a declarative model",
		formula: "\\text{Constraints}(D) = |\\mathfrak{C}|",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SN6",
		name: "Separability",
		description:
			"Assesses the extent to which the model can be divided into independent parts. The number of weakly connected components over the number of activities and constraints in a declarative process model",
		formula:
			"\\operatorname{Separability}(D)=\\frac{|\\operatorname{Comp}(D)|}{\\left|A\\right|+\\left|\\mathfrak{C}\\right|}",
		reference: {
			name: "Complexity in declarative process models",
			url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "BH1",
		name: "Semantical Redundancy",
		description:
			"Assesses whether each constraint in a Declare process model contributes to defining the set of compliant traces, or if its removal would not affect the overall behavior intended by the model",
		formula:
			"\\text{We say that constraint } C \\text{ is redundant in model } D \\text{ if the set of compliant traces (i.e., the language defined by } D \\text{) is not affected by the presence of } C \\text{. Let } D'=(A, \\mathfrak{C}\\backslash\\{C\\}) \\text{ be the declarative process model obtained from } D \\text{ by removing constraint } C \\text{. We then have that } C \\text{ is redundant in } D \\text{ if } L(D) = L(D')",
		reference: {
			name: "Resolving inconsistencies and redundancies in declarative process models",
			url: "https://www.inf.unibz.it/~montali/papers/diciccio-etal-IS2017-declarative-discovery.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "BH2",
		name: "Consistency",
		description:
			"Assesses whether a model allows for at least one valid execution trace that satisfies all the constraints simultaneously",
		formula:
			"D \\text{ is consistent if and only if the LTL formula } \\phi D=\\phi C_{1} \\wedge \\phi C_{2} \\wedge \\ldots \\wedge \\phi C_{n} \\text{ is satisfiable}",
		reference: {
			name: "Ensuring Model Consistency in Declarative Process Discovery",
			url: "https://www.diciccio.net/claudio/preprints/DiCiccio-etal-BPM2015-EnsuringModelConsistency.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SO1",
		name: "Purpose",
		description:
			"A qualitative descriptor defining the model's intended usage and operational objectives within process management",
		formula: "N/A",
		reference: {
			name: "Declarative Modeling: An Academic Dream or the Future for BPM?",
			url: "https://pure.itu.dk/ws/portalfiles/portal/78918062/declare_bpm_review.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
	{
		ID: "SO2",
		name: "Application Domain",
		description:
			"A contextual identifier specifying the business or operational environment where the declarative model is applied",
		formula: "N/A",
		reference: {
			name: "Declarative Modeling: An Academic Dream or the Future for BPM?",
			url: "https://pure.itu.dk/ws/portalfiles/portal/78918062/declare_bpm_review.pdf",
		},
		author: "6712681d35073df727e2ad7e",
	},
];
