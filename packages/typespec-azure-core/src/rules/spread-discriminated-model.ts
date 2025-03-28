import { Model, createRule, getDiscriminator, paramMessage } from "@typespec/compiler";
import { SyntaxKind } from "@typespec/compiler/ast";

export const spreadDiscriminatedModelRule = createRule({
  name: "spread-discriminated-model",
  description: "Check a model with a discriminator has not been used in composition.",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/spread-discriminated-model",
  messages: {
    default: paramMessage`Model '${"name"}' is being spread but has a discriminator. The relation between those 2 models will be lost and defeat the purpose of \`@discriminator\` Consider using \`extends\` instead.`,
  },
  create(context) {
    const visited = new Set<Model>();

    return {
      modelProperty: (property) => {
        const model = property.model;
        if (
          model &&
          model.node?.kind === SyntaxKind.ModelStatement &&
          property.sourceProperty &&
          property.sourceProperty.model
        ) {
          const targetModel = property.sourceProperty.model;
          if (visited.has(targetModel)) {
            return;
          }
          visited.add(targetModel);

          if (model.sourceModel === targetModel) {
            return;
          }
          if (getDiscriminator(context.program, targetModel) !== undefined) {
            const diagnosticTarget =
              model.node.properties.find(
                (x) =>
                  x.kind === SyntaxKind.ModelSpreadProperty &&
                  context.program.checker.getTypeForNode(x.target) === targetModel,
              ) ?? model;
            context.reportDiagnostic({
              format: {
                name: targetModel.name,
              },
              target: diagnosticTarget,
            });
          }
        }
      },
    };
  },
});
