import { createRule, ignoreDiagnostics, Operation } from "@typespec/compiler";
import { getHttpOperation } from "@typespec/http";

export const noHeaderExplodeRule = createRule({
  name: "no-header-explode",
  description: "It is recommended to serialize header parameter without explode: true",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/no-header-explode",
  messages: {
    default: `It is preferred to not use explode: true for header parameters`,
  },
  create(context) {
    return {
      operation: (operation: Operation) => {
        const httpOperation = ignoreDiagnostics(getHttpOperation(context.program, operation));
        for (const prop of httpOperation.parameters.properties.filter((x) => x.kind === "header")) {
          if (prop.options.explode === true) {
            context.reportDiagnostic({
              target: prop.property,
            });
          }
        }
      },
    };
  },
});
