import "./base.tsp";
import "../../node_modules/@azure-tools/typespec-azure-resource-manager/lib/common-types/types.tsp";

using OpenAPI;

namespace Azure.ResourceManager.CommonTypes;

@@extension(OperationIdParameter, "x-ms-parameter-location", "method");

@@extension(ResourceGroupNameParameter, "x-ms-parameter-location", "method");

@@extension(LocationParameter, "x-ms-parameter-location", "method");

op registerParams(
  ...ApiVersionParameter,
  ...LocationParameter,
  ...ManagementGroupNameParameter,
  ...OperationIdParameter,
  ...ResourceGroupNameParameter,
  ...ScopeParameter,
  ...SubscriptionIdParameter,
  ...TenantIdParameter,
): void;
