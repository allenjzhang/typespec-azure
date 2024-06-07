import "@azure-tools/typespec-autorest";
import "@azure-tools/typespec-client-generator-core";
import "../../typespec-azure-resource-manager/lib/common-types/customer-managed-keys.tsp";

using Autorest;
using ClientGenerator.Core;

namespace Azure.ResourceManager.CommonTypes;

@@clientName(Encryption, "encryption", "@azure-tools/typespec-autorest");
