import {
  ArrayModelType,
  ModelProperty,
  Program,
  createRule,
  getProperty,
  isArrayModelType,
  paramMessage,
} from "@typespec/compiler";
import { getExtensions } from "@typespec/openapi";
import { isArmCommonType } from "../common-types.js";

export const missingXmsIdentifiersRule = createRule({
  name: "missing-x-ms-identifiers",
  description: `Array properties should describe their identifying properties with x-ms-identifiers. Decorate the property with @OpenAPI.extension("x-ms-identifiers", [id-prop])  where "id-prop" is a list of the names of identifying properties in the item type.`,
  severity: "warning",
  url: "https://azure.github.io/typespec-azure/docs/libraries/azure-resource-manager/rules/missing-x-ms-identifiers",
  messages: {
    default: `Missing identifying properties of objects in the array item, please add @OpenAPI.extension("x-ms-identifiers", [<prop>]) to specify it. If there are no appropriate identifying properties, please add @OpenAPI.extension("x-ms-identifiers",[]).`,
    notArray: paramMessage`Value passed to @OpenAPI.extension("x-ms-identifiers",...) was a "${"valueType"}". Pass an array of property name.`,
    missingProperty: paramMessage`Property "${"propertyName"}" is not found in "${"targetModelName"}". Make sure value of x-ms-identifiers extension are valid property name of the array element.`,
  },
  create(context) {
    return {
      modelProperty: (property: ModelProperty) => {
        const type = property.type;
        if (type.kind === "Model" && isArrayModelType(context.program, type)) {
          if (isArrayMissingIdentifier(context.program, type, property)) {
            context.reportDiagnostic({
              target: property,
            });
          }
        }
      },
    };

    function isArrayMissingIdentifier(
      program: Program,
      array: ArrayModelType,
      property: ModelProperty,
    ) {
      const elementType = array.indexer.value;
      if (elementType.kind !== "Model") {
        return false;
      }

      if (isArmCommonType(elementType)) {
        return false;
      }

      if (getProperty(elementType, "id")) {
        return false;
      }

      const xmsIdentifiers = getExtensions(program, property ?? array).get("x-ms-identifiers");
      if (xmsIdentifiers === undefined) {
        return true;
      }

      if (Array.isArray(xmsIdentifiers)) {
        for (const propIdentifier of xmsIdentifiers) {
          if (typeof propIdentifier === "string") {
            const props = propIdentifier.replace(/^\//, "").split("/");
            let element = elementType;
            for (const prop of props) {
              const propertyValue = getProperty(element, prop);
              if (propertyValue === undefined) {
                context.reportDiagnostic({
                  messageId: "missingProperty",
                  format: { propertyName: prop, targetModelName: elementType.name },
                  target: property,
                });
              }

              const propertyType = propertyValue?.type as ArrayModelType;
              if (propertyType !== undefined && propertyType.kind === "Model") {
                element = propertyType;
              }
            }
          } else {
            context.reportDiagnostic({
              messageId: "notArray",
              format: { valueType: typeof propIdentifier },
              target: property,
            });
          }
        }
      } else {
        context.reportDiagnostic({
          messageId: "notArray",
          format: { valueType: typeof xmsIdentifiers },
          target: property,
        });
      }

      return false;
    }
  },
});
