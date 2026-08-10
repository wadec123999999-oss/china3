const VALID_RESULTS = new Set(["pass", "conditional_pass", "fail", "incomplete"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function validateFieldRunRecord(database, record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, errors: ["record must be an object"] };
  }

  const run = ensureArray(database.field_run_plan).find((item) => item.run_id === record.run_id);
  if (!run) errors.push(`unknown run_id: ${record.run_id ?? "(missing)"}`);
  if (!isNonEmptyString(record.field_date)) errors.push("field_date is required");
  if (!isNonEmptyString(record.tester)) errors.push("tester is required");
  if (!isNonEmptyString(record.weather_crowd)) errors.push("weather_crowd is required");
  if (!VALID_RESULTS.has(record.result)) errors.push("result must be pass, conditional_pass, fail or incomplete");

  const evidence = ensureArray(record.evidence);
  if (record.result !== "incomplete" && evidence.length < 2) {
    errors.push("a concluded record needs at least two evidence items");
  }
  evidence.forEach((item, index) => {
    if (!isNonEmptyString(item?.type)) errors.push(`evidence[${index}].type is required`);
    if (!isNonEmptyString(item?.reference)) errors.push(`evidence[${index}].reference is required`);
    if (!isNonEmptyString(item?.description)) errors.push(`evidence[${index}].description is required`);
  });

  if (record.result === "pass") {
    for (const field of ["actual_minutes", "entrance_exit", "fallback_exit", "issues_changes"]) {
      if (!isNonEmptyString(record[field])) errors.push(`${field} is required before marking a run pass`);
    }
    if (record.safety_blocking === true) errors.push("a pass cannot have safety_blocking=true");
  }
  if (record.result === "conditional_pass" && !isNonEmptyString(record.conditions)) {
    errors.push("conditions is required for conditional_pass");
  }
  if (record.result === "fail" && !isNonEmptyString(record.failure_reason)) {
    errors.push("failure_reason is required for fail");
  }

  return {
    valid: errors.length === 0,
    errors,
    run,
    launchCheckId: run?.launch_check_id ?? null,
  };
}

export function summarizeFieldProgress(database, records) {
  const normalized = ensureArray(records);
  const byRunId = new Map(normalized.map((record) => [record.run_id, record]));
  const fieldRuns = ensureArray(database.field_run_plan);
  const launchChecks = ensureArray(database.launch_field_checks);
  const suppliers = ensureArray(database.supplier_candidates);

  const checks = launchChecks.map((check) => {
    const expectedRuns = fieldRuns.filter((run) => run.launch_check_id === check.launch_check_id);
    const received = expectedRuns.map((run) => byRunId.get(run.run_id)).filter(Boolean);
    const passedRuns = received.filter((record) => record.result === "pass");
    const conditionalRuns = received.filter((record) => record.result === "conditional_pass");
    const failedRuns = received.filter((record) => record.result === "fail");
    const ready = expectedRuns.length > 0 && passedRuns.length === expectedRuns.length;
    return {
      launchCheckId: check.launch_check_id,
      object: check.object,
      requiredRuns: expectedRuns.map((run) => run.run_id),
      receivedRuns: received.map((record) => record.run_id),
      passedRuns: passedRuns.map((record) => record.run_id),
      conditionalRuns: conditionalRuns.map((record) => record.run_id),
      failedRuns: failedRuns.map((record) => record.run_id),
      ready,
    };
  });

  const experienceProducts = ensureArray(database.experience_products).map((product) => {
    const requiredChecks = String(product.required_checks ?? "").split("|").filter(Boolean);
    const fieldChecksPassed = requiredChecks.length > 0 && requiredChecks.every(
      (checkId) => checks.find((check) => check.launchCheckId === checkId)?.ready,
    );
    const supplier = suppliers.find((item) => item.supplier_id === product.supplier_candidate_id);
    const supplierAdmitted = supplier?.admission_status === "已准入" && Number(supplier?.gates_passed) >= 7;
    return {
      experienceId: product.experience_id,
      name: product.english_name,
      fieldChecksPassed,
      supplierAdmitted,
      sellable: fieldChecksPassed && supplierAdmitted,
      releaseReason: fieldChecksPassed && supplierAdmitted
        ? "All static launch gates are passed; live availability and dynamic checks still apply."
        : "Not sellable: every required field check must pass and the supplier must pass all seven admission gates.",
    };
  });

  return {
    totalRuns: fieldRuns.length,
    receivedRuns: fieldRuns.filter((run) => byRunId.has(run.run_id)).length,
    passedRuns: fieldRuns.filter((run) => byRunId.get(run.run_id)?.result === "pass").length,
    conditionalRuns: fieldRuns.filter((run) => byRunId.get(run.run_id)?.result === "conditional_pass").length,
    failedRuns: fieldRuns.filter((run) => byRunId.get(run.run_id)?.result === "fail").length,
    launchChecks: checks,
    experienceProducts,
  };
}
