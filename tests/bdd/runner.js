export const createStepRunner = (stepDefinitions) => {
  return async (step, context) => {
    for (const definition of stepDefinitions) {
      const match = step.text.match(definition.pattern);
      if (match) {
        await definition.action(context, ...match.slice(1));
        return;
      }
    }
    throw new Error(`No step definition for: ${step.keyword} ${step.text}`);
  };
};

export const runFeature = (test, feature, stepDefinitions) => {
  const runStep = createStepRunner(stepDefinitions);

  feature.scenarios.forEach((scenario) => {
    test(`${feature.name} — ${scenario.name}`, async ({ page }) => {
      const context = { page };
      for (const step of scenario.steps) {
        await runStep(step, context);
      }
    });
  });
};
