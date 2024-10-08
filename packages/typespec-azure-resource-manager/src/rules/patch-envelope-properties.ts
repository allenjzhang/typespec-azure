import { Model, Type, createRule, getProperty, paramMessage } from "@typespec/compiler";

import { getArmResources } from "../resource.js";

export const patchEnvelopePropertiesRules = createRule({
  name: "patch-envelope",
  severity: "warning",
  description: "Patch envelope properties should match the resource properties.",
  messages: {
    default: paramMessage`The Resource PATCH request for resource '${"resourceName"}' is missing envelope properties:  [${"propertyName"}]. Since these properties are supported in the resource, they must also be updatable via PATCH.`,
  },
  create(context) {
    const patchEnvelopeProperties: string[] = ["identity", "managedBy", "plan", "sku", "tags"];
    return {
      model: (model: Model) => {
        const resources = getArmResources(context.program);
        const armResource = resources.find((re) => re.typespecType === model);

        if (
          armResource &&
          armResource.operations.lifecycle.update &&
          armResource.operations.lifecycle.createOrUpdate
        ) {
          const updateOperationProperties =
            armResource.operations.lifecycle.update.httpOperation.parameters.body?.type;
          const missingProperties: string[] = [];
          for (const property of patchEnvelopeProperties) {
            if (!checkForPatchProperty(property, model, updateOperationProperties)) {
              missingProperties.push(property);
            }
          }
          if (missingProperties.length > 0) {
            context.reportDiagnostic({
              format: { resourceName: model.name, propertyName: missingProperties.join(", ") },
              target:
                updateOperationProperties?.kind === "Model"
                  ? updateOperationProperties
                  : armResource.operations.lifecycle.update.operation,
            });
          }
        }
      },
    };
  },
});

function checkForPatchProperty(
  propertyName: string,
  resourceModel: Model,
  patchModel: Type | undefined,
): boolean {
  return (
    getProperty(resourceModel, propertyName) === undefined ||
    (patchModel?.kind === "Model" && getProperty(patchModel, propertyName) !== undefined)
  );
}
