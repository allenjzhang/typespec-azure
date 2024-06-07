import "@azure-tools/typespec-autorest";
import "../../typespec-azure-resource-manager/lib/common-types/types.tsp";

using Autorest;
using OpenAPI;

namespace Azure.ResourceManager.CommonTypes;

@@extension(OperationIdParameter, "x-ms-parameter-location", "method");

@@extension(ResourceGroupNameParameter, "x-ms-parameter-location", "method");

@@extension(LocationParameter, "x-ms-parameter-location", "method");
