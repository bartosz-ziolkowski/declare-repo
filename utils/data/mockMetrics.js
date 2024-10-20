export const mockMetrics = [
  {
    ID: "SN1",
    name: "Size",
    description:
      "A metric that for a declarative process model represented as a graph G is a sum of its activities and constraints",
    formula:
      "\operatorname{Size}(G)=\left|A_{G}\right|+\left|C_{G}\right|",
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
      "The ratio of constraints to activities in a model. The maximum number of constraints over the number of activities in a weakly connected components of a graph G that represents a declarative process model",
    formula:
      "\operatorname{Density}(\mathrm{G})=\max _{c \in \operatorname{Comp}(G)} \frac{\left|C_{c}\right|}{\left|A_{c}\right|}",
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
      "Assesses the variety of constraint types used in a model. Max. entropy over the different constraint types in the components of a Declare model represented as a graph G",
    formula:
      "\text{ConstraintVariability}(G) =\max _{c \in\left\{c^{\prime}\left|c^{\prime} \in \operatorname{Comp}(G) \wedge\right| C_{c^{\prime}} \mid>0\right\}}\left\{-\sum_{t \in \mathcal{T}_{c}} p(c, t) \cdot \log_{|\mathcal{T}|}(p(c, t))\right\}",
    reference: {
      name: "Complexity in declarative process models",
      url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SN4",
    name: "Number of activities",
    description:
      "The number of activities of a declarative model represented as a graph G",
    formula: "\text{Activities}(G) =\left|A_{G}\right|",
    reference: {
      name: "Complexity in declarative process models",
      url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SN5",
    name: "Number of constraints",
    description:
      "The number of constraints of a declarative model represented as a graph G",
    formula: "\text{Constraints}(G) = |C_G|",
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
      "Assesses the extent to which the model can be divided into independent parts. The number of weakly connected components over the number of activities and constraints in a declarative process model represented as a graph G",
    formula:
      "\operatorname{Separability}(G)=\frac{|\operatorname{Comp}(G)|}{\left|A_{G}\right|+\left|C_{G}\right|}",
    reference: {
      name: "Complexity in declarative process models",
      url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/330066936/1_s2.0_S0957417423014264_main.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SM1",
    name: "Application Domain",
    description: "Expresses in which field the model is grounded",
    formula: "",
    reference: {
      name: "Declarative Modeling: An Academic Dream or the Future for BPM?",
      url: "https://pure.itu.dk/ws/portalfiles/portal/78918062/declare_bpm_review.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SM2",
    name: "Consistency",
    description:
      "Assesses whether a model allows for at least one valid execution trace that satisfies all the constraints simultaneously",
    formula:
      "A Declare process model M is consistent if and only if the LTL formula $$\phi M=\phi \mathrm{C}_{1} \wedge \phi \mathrm{C}_{2} \wedge \ldots \wedge \phi \mathrm{C}_{|\mathrm{M}|}$$ is satisfiable, where $$\phi \mathrm{C}_{\mathrm{i}}$$ is the LTL formula corresponding to constraint $$\mathrm{C}_{\mathrm{i}}$$.",
    reference: {
      name: "Ensuring Model Consistency in Declarative Process Discovery",
      url: "https://www.diciccio.net/claudio/preprints/DiCiccio-etal-BPM2015-EnsuringModelConsistency.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SM3",
    name: "Purpose",
    description:
      "Expresses what is the point of storing a model in a repository",
    formula: "",
    reference: {
      name: "Declarative Modeling: An Academic Dream or the Future for BPM?",
      url: "https://pure.itu.dk/ws/portalfiles/portal/78918062/declare_bpm_review.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  {
    ID: "SM4",
    name: "Semantical Redundancy",
    description:
      "Assesses whether each constraint in a Declare process model contributes to defining the set of compliant traces, or if its removal would not affect the overall behavior intended by the model",
    formula:
      "Let $$M=\langle A, C, \Gamma\rangle$$ and let $$C \in \Gamma$$ be a constraint of $$M$$. We say that $$C$$ is redundant in $$M$$ if the set of compliant traces (i.e., the language defined by $$M$$ ) is not affected by the presence of $$C$$. $$M^{\prime}=\langle A, C, \Gamma \backslash\{C\}\rangle$$ be the declarative process model obtained from $$M$$ by removing constraint $$C$$. We then have that $$C$$ is redundant in $$M$$ if $$L(M)=L\left(M^{\prime}\right)$$.",
    reference: {
      name: "Resolving inconsistencies and redundancies in declarative process models",
      url: "https://www.inf.unibz.it/~montali/papers/diciccio-etal-IS2017-declarative-discovery.pdf",
    },
    author: "6712681d35073df727e2ad7e",
  },
  
];
