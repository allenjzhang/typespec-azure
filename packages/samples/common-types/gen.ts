import {
  getAllServicesAtAllVersions,
  resolveAutorestOptions,
} from "@azure-tools/typespec-autorest";
import { NodeHost, compile } from "@typespec/compiler";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const pkgRoot = dirname(dir);

const program = await compile(NodeHost, resolve(dir, "main.tsp"), {
  additionalImports: [
    resolve(
      pkgRoot,
      "node_modules/@azure-tools/typespec-azure-resource-manager/lib/common-types/customer-managed-keys.tsp"
    ),
  ],
});

const output = await getAllServicesAtAllVersions(program, resolveAutorestOptions(program, dir, {}));

console.log("output", output);
