import {
  CodeFix,
  CodeFixContext,
  createRule,
  getSourceLocation,
  listServices,
  Namespace,
  paramMessage,
} from "@typespec/compiler";
import { getVersion } from "@typespec/versioning";
import { findLineStartAndIndent } from "./utils.js";
export const requireVersionedRule = createRule({
  name: "require-versioned",
  description: "Azure services should use the versioning library.",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/require-versioned",
  messages: {
    default: paramMessage`Azure services should use the versioning library to define versions for their services. Add the '@versioned' decorator to the service namespace.`,
  },
  create(context) {
    return {
      root: (program) => {
        const services = listServices(program);
        for (const service of services) {
          if (getVersion(program, service.type) === undefined) {
            context.reportDiagnostic({
              format: { serviceName: service.type },
              target: service.type,
              codefixes: [createAddVersionedCodeFix(service.type)],
            });
          }
        }
      },
    };
  },
});

function createAddVersionedCodeFix(namespace: Namespace): CodeFix {
  return {
    id: "add-versioned",
    label: "Add @versioned",
    fix(context: CodeFixContext) {
      const location = getSourceLocation(namespace);
      const { lineStart, indent } = findLineStartAndIndent(location);
      const updatedLocation = { ...location, pos: lineStart };
      return context.prependText(
        updatedLocation,
        `${indent}@versioned(Versions /* create an enum called Versions with your service version */)\n`,
      );
    },
  };
}
