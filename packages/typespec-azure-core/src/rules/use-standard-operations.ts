import {
  Operation,
  createRule,
  getNamespaceFullName,
  isTemplateDeclarationOrInstance,
  paramMessage,
} from "@typespec/compiler";

function derivesFromAzureCoreOperation(operation: Operation): boolean {
  // Check every link in the signature chain
  while (operation.sourceOperation) {
    if (
      operation.sourceOperation.namespace &&
      getNamespaceFullName(operation.sourceOperation.namespace) === "Azure.Core"
    ) {
      return true;
    }

    // See if the base operation ultimately derives from an Azure.Core operation
    operation = operation.sourceOperation;
  }

  return false;
}

export const useStandardOperations = createRule({
  name: "use-standard-operations",
  description: "Operations should be defined using a signature from the Azure.Core namespace.",
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-core/rules/use-standard-operations",
  messages: {
    default: paramMessage`Operation '${"name"}' should be defined using a signature from the Azure.Core namespace.`,
  },
  create(context) {
    return {
      operation: (operationContext: Operation) => {
        // Can we skip this operation?  Either it or the interface it's defined in
        // has to be defined in an approved namespace, or the operation itself must
        // be templated.
        if (isTemplateDeclarationOrInstance(operationContext)) {
          return;
        }

        // If the operation comes from a TypeSpec.Rest.Resource interface, skip it
        // because another linting rule will mark the whole interface instead
        if (
          operationContext.interface &&
          operationContext.namespace &&
          getNamespaceFullName(operationContext.namespace) === "TypeSpec.Rest.Resource"
        ) {
          return;
        }

        // Otherwise, if the operation signature is a raw declaration or does not
        // derive from an operation in Azure.Core, it violates this linting rule.
        if (!derivesFromAzureCoreOperation(operationContext)) {
          context.reportDiagnostic({
            // If the namespace where the operation's interface is defined is
            // different than the namespace we're in, mark the operation's
            // interface instead so that the diagnostic doesn't end up on a
            // library operation
            target:
              operationContext.interface &&
              operationContext.interface.namespace !== operationContext.namespace
                ? operationContext.interface
                : operationContext,
            format: {
              name: operationContext.name,
            },
          });
        }
      },
    };
  },
});
