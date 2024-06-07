import "@typespec/openapi";
import "@typespec/http";
import "@typespec/rest";
import "@typespec/versioning";
import "@azure-tools/typespec-azure-core";

// import "../../typespec-azure-resource-manager/lib/common-types/customer-managed-keys.tsp";

using TypeSpec.Versioning;

@versioned(Versions)
@service({
  title: "Common Types",
})
namespace Azure.ResourceManager.CommonTypes;

@doc("The Azure Resource Manager common-types versions.")
enum Versions {
  @useDependency(Azure.Core.Versions.v1_0_Preview_1)
  @doc("The Azure Resource Manager v3 common types.")
  v3,

  @useDependency(Azure.Core.Versions.v1_0_Preview_2)
  @doc("The Azure Resource Manager v4 common types.")
  v4,

  @useDependency(Azure.Core.Versions.v1_0_Preview_2)
  @doc("The Azure Resource Manager v5 common types.")
  v5,
}

@format("uuid")
scalar uuid<T extends string = "uuid"> extends string;
