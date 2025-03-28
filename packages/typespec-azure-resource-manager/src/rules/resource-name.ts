import {
  Model,
  ModelProperty,
  SemanticNodeListener,
  createRule,
  getProperty,
} from "@typespec/compiler";
import * as http from "@typespec/http";

import { isReadonlyProperty } from "@typespec/openapi";
import { getArmResources } from "../resource.js";

/**
 * The resource 'name' field should be marked with 'read' visibility and an @path decorator.
 */
export const resourceNameRule = createRule({
  name: "resource-name",
  severity: "warning",
  description: "Check the resource name.",
  messages: {
    default: `The resource 'name' field should be marked with 'read' visibility and an @path decorator.`,
    nameInvalid: "Arm resource name must contain only alphanumeric characters.",
  },
  create(context): SemanticNodeListener {
    return {
      model: (model: Model) => {
        const resources = getArmResources(context.program);
        const armResource = resources.find((re) => re.typespecType === model);

        if (armResource) {
          if (!checkResourceModelName(model.name)) {
            context.reportDiagnostic({
              messageId: "nameInvalid",
              target: model,
            });
          }
          // check that the name property is properly attributed
          const name = getProperty(model, "name");
          if (name && checkResourceName(name)) {
            context.reportDiagnostic({
              target: name,
            });
          }
        }

        function checkResourceName(nameProp: ModelProperty) {
          return !(
            http.isPathParam(context.program, nameProp) &&
            isReadonlyProperty(context.program, nameProp)
          );
        }

        function checkResourceModelName(name: string): boolean {
          const matches = name.match(/^[A-Z][0-9A-Za-z]+$/);
          return matches !== null && matches.length === 1;
        }
      },
    };
  },
});
