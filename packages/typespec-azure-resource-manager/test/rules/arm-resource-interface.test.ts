import {
  BasicTestRunner,
  LinterRuleTester,
  createLinterRuleTester,
} from "@typespec/compiler/testing";
import { beforeEach, describe, it } from "vitest";
import { interfacesRule } from "../../src/rules/arm-resource-interfaces.js";
import { createAzureResourceManagerTestRunner } from "../test-host.js";

describe("typespec-azure-resource-manager: detect non-post actions", () => {
  let runner: BasicTestRunner;
  let tester: LinterRuleTester;

  beforeEach(async () => {
    runner = await createAzureResourceManagerTestRunner();
    tester = createLinterRuleTester(
      runner,
      interfacesRule,
      "@azure-tools/typespec-azure-resource-manager"
    );
  });

  it("Detects interfaces without @armResourceOperations", async () => {
    await tester
      .expect(
        `
    @service({title: "Microsoft.Foo"})
    @versioned(Versions)
    @armProviderNamespace
    namespace Microsoft.Foo;
      @doc(".")
      enum Versions {
        @doc(".")
        @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
        v2021_09_21: "2022-09-21-preview",
        @doc(".")
        @useDependency(Azure.ResourceManager.Versions.v1_0_Preview_1)
        v2022_01_10: "2022-01-10-alpha.1"
      }

      interface Operations extends Azure.ResourceManager.Operations {}

      @doc("Foo resource")
      model FooResource is TrackedResource<FooProperties> {
        @visibility("read")
        @doc("The name of the all properties resource.")
        @key("foo")
        @segment("foo")
        @path
        name: string;
        ...ManagedServiceIdentityProperty;
      }

      interface FooResources
        extends TrackedResourceOperations<FooResource, FooProperties> {
        }

        @doc("The state of the resource")
        enum ResourceState {
         @doc(".") Succeeded,
         @doc(".") Canceled,
         @doc(".") Failed
       }

       @doc("Foo resource")
       model FooProperties {
         @doc("Name of the resource")
         displayName?: string = "default";
         @doc("The provisioning State")
         provisioningState: ResourceState;
       }
    `
      )
      .toEmitDiagnostics({
        code: "@typespec/versioning/using-versioned-library",
        message:
          "Namespace 'Microsoft.Foo' is referencing types from versioned namespace 'Azure.ResourceManager.CommonTypes' but didn't specify which versions with @useDependency.",
      });
  });
});
