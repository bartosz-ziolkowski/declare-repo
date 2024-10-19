export function calculateMetrics(fileContent) {
  if (!fileContent || fileContent.trim() === "") {
    return {
      SM1: "",
      SM3: "",
    };
  }

  const lines = fileContent.split("\n");

  // SN4: Number of activities
  const activities = lines.filter((line) =>
    line.trim().startsWith("activity")
  ).length;

  // SN5: Number of constraints
  const constraintLines = lines.filter((line) => /^[A-Z]/.test(line.trim()));
  const constraints = constraintLines.length;

  // SN1: Size
  const size = activities + constraints;

  // SN2: Density
  const density = constraints > 0 ? (constraints / activities).toFixed(3) : 0;

  // SN3: Constraint Variability
  const uniqueConstraints = new Set(
    constraintLines.map(extractConstraintName).filter(Boolean)
  );
  const uniqueConstraintCount = uniqueConstraints.size;

  const variability =
    constraints > 0 ? (uniqueConstraintCount / 30).toFixed(3) : 0;

  // SN6: Separability
  // For this simplified version, I assume the entire model is one component
  const separability = (1 / (activities + constraints)).toFixed(3);

  return {
    SN1: size,
    SN2: parseFloat(density),
    SN3: parseFloat(variability),
    SN4: activities,
    SN5: constraints,
    SN6: parseFloat(separability),
    SM1: "",
    SM3: "",
  };
}

function extractConstraintName(line) {
  const match = line.match(
    /^((?:Not\s+)?(?:Alternate\s+|Chain\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\d+)?)\[/
  );
  return match ? match[1].trim() : null;
}
