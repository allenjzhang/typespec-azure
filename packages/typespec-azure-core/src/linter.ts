import { defineLinter } from "@typespec/compiler";
import { authRequiredRule } from "./rules/auth-required.js";
import { badRecordTypeRule } from "./rules/bad-record-type.js";
import { byosRule } from "./rules/byos.js";
import { casingRule } from "./rules/casing-style.js";
import { compositionOverInheritanceRule } from "./rules/composition-over-inheritance.js";
import { friendlyNameRule } from "./rules/friendly-name.js";
import { knownEncodingRule } from "./rules/known-encoding.js";
import { longRunningOperationsRequirePollingOperation } from "./rules/lro-polling-operation.js";
import { noClosedLiteralUnionRule } from "./rules/no-closed-literal-union.js";
import { noEnumRule } from "./rules/no-enum.js";
import { noErrorStatusCodesRule } from "./rules/no-error-status-codes.js";
import { noExplicitRoutesResourceOps } from "./rules/no-explicit-routes-resource-ops.js";
import { noGenericNumericRule } from "./rules/no-generic-numeric.js";
import { noHeaderExplodeRule } from "./rules/no-header-explode.js";
import { noLegacyUsage } from "./rules/no-legacy-usage.js";
import { noMultipleDiscriminatorRule } from "./rules/no-multiple-discriminator.js";
import { noNullableRule } from "./rules/no-nullable.js";
import { noOffsetDateTimeRule } from "./rules/no-offsetdatetime.js";
import { noOpenAPIRule } from "./rules/no-openapi.js";
import { noPrivateUsage } from "./rules/no-private-usage.js";
import { noQueryExplodeRule } from "./rules/no-query-explode.js";
import { noResponseBodyRule } from "./rules/no-response-body.js";
import { noRpcPathParamsRule } from "./rules/no-rpc-path-params.js";
import { noStringDiscriminatorRule } from "./rules/no-string-discriminator.js";
import { nonBreakingVersioningRule } from "./rules/non-breaking-versioning.js";
import { apiVersionRule } from "./rules/operation-missing-api-version.js";
import { preventFormatRule } from "./rules/prevent-format.js";
import { preventRestLibraryInterfaces } from "./rules/prevent-rest-library.js";
import { preventUnknownType } from "./rules/prevent-unknown.js";
import { bodyArrayRule } from "./rules/request-body-array.js";
import { requireDocumentation } from "./rules/require-docs.js";
import { requireKeyVisibility } from "./rules/require-key-visibility.js";
import { requireVersionedRule } from "./rules/require-versioned.js";
import { responseSchemaMultiStatusCodeRule } from "./rules/response-schema-multi-status-code.js";
import { rpcOperationRequestBodyRule } from "./rules/rpc-operation-request-body.js";
import { spreadDiscriminatedModelRule } from "./rules/spread-discriminated-model.js";
import { useStandardNames } from "./rules/use-standard-names.js";
import { useStandardOperations } from "./rules/use-standard-operations.js";

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
  noOpenAPIRule,
  noHeaderExplodeRule,
  preventFormatRule,
  noMultipleDiscriminatorRule,
  preventRestLibraryInterfaces,
  preventUnknownType,
  badRecordTypeRule,
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
  noLegacyUsage,
  noQueryExplodeRule,
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
