import "@azure-tools/typespec-autorest";
import "../../typespec-azure-resource-manager/lib/common-types/private-links.tsp";

using Autorest;

namespace Azure.ResourceManager.CommonTypes;

@useRef("./types.json#/definitions/Resource")
model Resource {}
