import "@typespec/rest";
import "@typespec/versioning";
import "@azure-tools/typespec-azure-core";
import "@azure-tools/typespec-azure-resource-manager";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.Versioning;
using Azure.Core;
using Azure.ResourceManager;

/** Contoso Resource Provider management API. */
@armProviderNamespace
@service({
  title: "ContosoProviderHubClient",
})
@versioned(Versions)
namespace Microsoft.ContosoProviderHub;

/** Contoso API versions */
enum Versions {
  /** 2021-10-01-preview version */
  @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
  @armCommonTypesVersion(Azure.ResourceManager.CommonTypes.Versions.v5)
  `2021-10-01-preview`,
}

/** A ContosoProviderHub resource */
model Employee is TrackedResource<EmployeeProperties> {
  ...ResourceNameParameter<Employee>;
}

/** Employee properties */
model EmployeeProperties {
  @Azure.ResourceManager.Private.armCommonDefinition("TestProp", "v5", "types.json")
  testProp: string;

  testMode: TestModel;
  testEnum: TestEnum;
  testUnion: TestUnion;
  ...DefaultProvisioningStateProperty;
}
@armResourceOperations
interface Employees {
  get is ArmResourceRead<Employee>;
}

@Azure.ResourceManager.Private.armCommonDefinition("TestProp", "v5", "types.json")
model TestModel {}

@Azure.ResourceManager.Private.armCommonDefinition("TestEnum", "v5", "types.json")
enum TestEnum {
  a,
  b,
}

@Azure.ResourceManager.Private.armCommonDefinition("TestUnion", "v5", "types.json")
union TestUnion {
  string,
  a: "a",
  b: "b",
}
