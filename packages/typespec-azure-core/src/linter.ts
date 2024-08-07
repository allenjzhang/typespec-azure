import { defineLinter } from "@typespec/compiler";
import { apiVersionRule } from "./rules/api-version-parameter.js";
import { authRequiredRule } from "./rules/auth-required.js";
import { byosRule } from "./rules/byos.js";
import { casingRule } from "./rules/casing.js";
import { compositionOverInheritanceRule } from "./rules/composition-over-inheritance.js";
import { friendlyNameRule } from "./rules/friendly-name.js";
import { knownEncodingRule } from "./rules/known-encoding.js";
import { longRunningOperationsRequirePollingOperation } from "./rules/lro-polling-operation.js";
import { noClosedLiteralUnionRule } from "./rules/no-closed-literal-union.js";
import { noEnumRule } from "./rules/no-enum.js";
import { noErrorStatusCodesRule } from "./rules/no-error-status-codes.js";
import { noExplicitRoutesResourceOps } from "./rules/no-explicit-routes-resource-ops.js";
import { noGenericNumericRule } from "./rules/no-generic-numeric.js";
import { noNullableRule } from "./rules/no-nullable.js";
import { noOffsetDateTimeRule } from "./rules/no-offsetdatetime.js";
import { operationIdRule } from "./rules/no-operation-id.js";
import { noPrivateUsage } from "./rules/no-private-usage.js";
import { noResponseBodyRule } from "./rules/no-response-body.js";
import { noRpcPathParamsRule } from "./rules/no-rpc-path-params.js";
import { noStringDiscriminatorRule } from "./rules/no-string-discriminator.js";
import { nonBreakingVersioningRule } from "./rules/non-breaking-versioning.js";
import { preferCsvCollectionFormatRule } from "./rules/prefer-csv-collection-format.js";
import { preventFormatUse } from "./rules/prevent-format.js";
import { preventMultipleDiscriminator } from "./rules/prevent-multiple-discriminator.js";
import { preventRestLibraryInterfaces } from "./rules/prevent-rest-library.js";
import { preventUnknownType } from "./rules/prevent-unknown.js";
import { propertyNameRule } from "./rules/property-naming.js";
import { recordTypeRule } from "./rules/record-types.js";
import { bodyArrayRule } from "./rules/request-body-array.js";
import { requireDocumentation } from "./rules/require-docs.js";
import { requireKeyVisibility } from "./rules/require-key-visibility.js";
import { requireVersionedRule } from "./rules/require-versioned.js";
import { responseSchemaMultiStatusCodeRule } from "./rules/response-schema-multi-status-code.js";
import { rpcOperationRequestBodyRule } from "./rules/rpc-operation-request-body.js";
import { spreadDiscriminatedModelRule } from "./rules/spread-discriminated-model.js";
import { useStandardNames } from "./rules/use-standard-names.js";
import { useStandardOperations } from "./rules/use-standard-ops.js";

const rules = [
  apiVersionRule,
  authRequiredRule,
  bodyArrayRule,
  byosRule,
  casingRule,
  compositionOverInheritanceRule,
  knownEncodingRule,
  longRunningOperationsRequirePollingOperation,
  noClosedLiteralUnionRule,
  noEnumRule,
  noErrorStatusCodesRule,
  noExplicitRoutesResourceOps,
  nonBreakingVersioningRule,
  noGenericNumericRule,
  noNullableRule,
  noOffsetDateTimeRule,
  noResponseBodyRule,
  noRpcPathParamsRule,
  operationIdRule,
  preferCsvCollectionFormatRule,
  preventFormatUse,
  preventMultipleDiscriminator,
  preventRestLibraryInterfaces,
  preventUnknownType,
  propertyNameRule,
  recordTypeRule,
  requireDocumentation,
  requireKeyVisibility,
  responseSchemaMultiStatusCodeRule,
  rpcOperationRequestBodyRule,
  spreadDiscriminatedModelRule,
  useStandardNames,
  useStandardOperations,
  noStringDiscriminatorRule,
  requireVersionedRule,
  friendlyNameRule,
  noPrivateUsage,
];

export const $linter = defineLinter({
  rules,
  ruleSets: {
    "canonical-versioning": {
      enable: {
        [`@azure-tools/typespec-azure-core/${nonBreakingVersioningRule.name}`]: true,
      },
    },
  },
});
