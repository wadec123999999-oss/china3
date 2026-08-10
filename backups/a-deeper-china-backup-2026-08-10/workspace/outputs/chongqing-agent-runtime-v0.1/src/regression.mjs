import { decide, validateInput } from "./core.mjs";

function flattenSelectedModules(result) {
  return result.days.flatMap((day) => day.modules.map((module) => module.moduleId));
}

function excludedModuleIds(result) {
  return result.audit.excludedModules.map((item) => item.moduleId);
}

export function evaluateFixture(database, fixture) {
  const failures = [];
  const checks = [];
  const check = (condition, label, detail = "") => {
    checks.push({ label, passed: Boolean(condition), detail });
    if (!condition) failures.push(detail ? `${label}: ${detail}` : label);
  };

  const validationErrors = validateInput(fixture.input);
  check(validationErrors.length === 0, "input_schema", validationErrors.join("; "));
  if (validationErrors.length) {
    return {
      testId: fixture.id,
      conversation: fixture.sourceConversation,
      passed: false,
      assertionCount: checks.length,
      failureCount: failures.length,
      failures,
      checks,
      result: null,
    };
  }

  const result = decide(database, fixture.input);
  const selected = flattenSelectedModules(result);
  const ranked = result.audit.rankedModuleIds;
  const excluded = excludedModuleIds(result);
  const followUps = result.followUps.map((item) => item.code);
  const dynamicChecks = result.audit.dynamicChecks;
  const expected = fixture.expect;
  const limit = ({ 精简: 2, 标准: 3, 深度: 4 })[fixture.input.trip.outputLength];

  check(result.requestId === fixture.id, "request_id", `expected ${fixture.id}, got ${result.requestId}`);
  check(result.days.length === fixture.input.trip.days, "day_count", `expected ${fixture.input.trip.days}, got ${result.days.length}`);
  check(
    result.days.every((day) => day.modules.length <= limit),
    "output_length_limit",
    `one or more days exceeded ${limit} modules`,
  );

  for (const code of expected.followUps ?? []) {
    check(followUps.includes(code), `follow_up:${code}`, `got ${followUps.join(",")}`);
  }
  for (const dynamicCheck of expected.dynamicChecks ?? []) {
    check(dynamicChecks.includes(dynamicCheck), `dynamic_check:${dynamicCheck}`, `got ${dynamicChecks.join(",")}`);
  }
  for (const moduleId of expected.excludedModules ?? []) {
    check(excluded.includes(moduleId), `excluded:${moduleId}`);
  }
  for (const moduleId of expected.excludedModulesAbsent ?? []) {
    check(!excluded.includes(moduleId), `not_excluded:${moduleId}`);
  }
  for (const moduleId of expected.selectedModules ?? []) {
    check(selected.includes(moduleId), `selected:${moduleId}`, `got ${selected.join(",")}`);
  }
  if (expected.selectedAny?.length) {
    check(
      expected.selectedAny.some((moduleId) => selected.includes(moduleId)),
      "selected_any",
      `expected one of ${expected.selectedAny.join(",")}; got ${selected.join(",")}`,
    );
  }
  if (expected.selectedDefaultDayAny?.length) {
    const selectedDefaultDays = result.days.flatMap((day) => day.modules.map((module) => module.defaultDay));
    check(
      expected.selectedDefaultDayAny.some((dayCode) => selectedDefaultDays.includes(dayCode)),
      "selected_default_day_any",
      `expected one of ${expected.selectedDefaultDayAny.join(",")}; got ${selectedDefaultDays.join(",")}`,
    );
  }
  if (expected.selectedRoleAny?.length) {
    const selectedRoles = result.days.flatMap((day) => day.modules.map((module) => module.role));
    check(
      expected.selectedRoleAny.some((role) => selectedRoles.some((selectedRole) => String(selectedRole).includes(role))),
      "selected_role_any",
      `expected one of ${expected.selectedRoleAny.join(",")}; got ${selectedRoles.join(",")}`,
    );
  }
  if (typeof expected.allDaysNonEmpty === "boolean") {
    check(
      result.days.every((day) => (day.modules.length > 0) === expected.allDaysNonEmpty),
      "all_days_non_empty",
    );
  }
  if (expected.allDaysEmpty) {
    check(result.days.every((day) => day.modules.length === 0), "all_days_empty");
  }
  if (expected.rankedAny?.length) {
    check(
      expected.rankedAny.some((moduleId) => ranked.includes(moduleId)),
      "ranked_any",
      `expected one of ${expected.rankedAny.join(",")}`,
    );
  }
  for (const dimension of expected.usedIntents ?? []) {
    check(result.audit.usedIntentDimensions.includes(dimension), `used_intent:${dimension}`);
  }
  for (const dimension of expected.ignoredIntents ?? []) {
    check(result.audit.ignoredLowConfidenceDimensions.includes(dimension), `ignored_intent:${dimension}`);
  }
  if (expected.commercialState) {
    check(result.commercial.state === expected.commercialState, "commercial_state", `expected ${expected.commercialState}, got ${result.commercial.state}`);
  }
  if (expected.commercialAction) {
    check(result.commercial.action === expected.commercialAction, "commercial_action", `expected ${expected.commercialAction}, got ${result.commercial.action}`);
  }
  if (typeof expected.mayQuote === "boolean") {
    check(result.commercial.mayQuote === expected.mayQuote, "may_quote", `expected ${expected.mayQuote}, got ${result.commercial.mayQuote}`);
  }
  if (typeof expected.mayTakePayment === "boolean") {
    check(result.commercial.mayTakePayment === expected.mayTakePayment, "may_take_payment", `expected ${expected.mayTakePayment}, got ${result.commercial.mayTakePayment}`);
  }
  if (expected.status) {
    check(result.status === expected.status, "status", `expected ${expected.status}, got ${result.status}`);
  }
  if (expected.totalDays) {
    check(result.days.length === expected.totalDays, "expected_total_days", `expected ${expected.totalDays}, got ${result.days.length}`);
  }
  if (expected.maxModulesPerDay) {
    check(
      result.days.every((day) => day.modules.length <= expected.maxModulesPerDay),
      "expected_max_modules_per_day",
      `one or more days exceeded ${expected.maxModulesPerDay}`,
    );
  }

  check(result.commercial.mayPromiseAvailability === false, "availability_never_promised");
  check(selected.every((moduleId) => ranked.includes(moduleId)), "selected_modules_are_ranked");

  return {
    testId: fixture.id,
    conversation: fixture.sourceConversation,
    passed: failures.length === 0,
    assertionCount: checks.length,
    failureCount: failures.length,
    failures,
    checks,
    result: {
      status: result.status,
      selectedModuleIds: selected,
      followUpCodes: followUps,
      dynamicChecks,
      excludedModuleIds: excluded,
      commercialState: result.commercial.state,
      commercialAction: result.commercial.action,
      mayQuote: result.commercial.mayQuote,
      mayTakePayment: result.commercial.mayTakePayment,
    },
  };
}

export function runRegression(database, fixtures) {
  const cases = fixtures.map((fixture) => evaluateFixture(database, fixture));
  return {
    generatedAt: new Date().toISOString(),
    databaseId: database.metadata.database_id,
    databaseVersion: database.metadata.version,
    totalCases: cases.length,
    passedCases: cases.filter((item) => item.passed).length,
    failedCases: cases.filter((item) => !item.passed).length,
    assertionCount: cases.reduce((sum, item) => sum + item.assertionCount, 0),
    cases,
  };
}
