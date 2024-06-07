import {
  getAllServicesAtAllVersions,
  resolveAutorestOptions,
  sortOpenAPIDocument,
} from "@azure-tools/typespec-autorest";
import { NodeHost, compile, logDiagnostics } from "@typespec/compiler";
import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const pkgRoot = dirname(dir);

await emitCommonTypesSwagger("customer-managed-keys");
await emitCommonTypesSwagger("managed-identity");
await emitCommonTypesSwagger("private-links");
await emitCommonTypesSwagger("types");

async function emitCommonTypesSwagger(name: string) {
  const program = await compile(NodeHost, resolve(dir, "main.tsp"), {
    additionalImports: [resolve(pkgRoot, `src/${name}.tsp`)],
  });

  const output = await getAllServicesAtAllVersions(
    program,
    resolveAutorestOptions(program, dir, {})
  );
  if (program.diagnostics.length > 0) {
    logDiagnostics(program.diagnostics, NodeHost.logSink);
    process.exit(1);
  }
  console.log("output", output);

  if (output.length !== 1) {
    throw new Error("Expected exactly one service");
  }
  const service = output[0];

  if (!service.versioned) {
    throw new Error("Expected exactly one service");
  }

  for (const version of service.versions) {
    const document = version.document;
    if (document.definitions === undefined || Object.keys(document.definitions).length === 0) {
      continue; // we don't save this file
    }

    delete document.schemes;
    delete document.produces;
    delete document.consumes;
    delete document.info["x-typespec-generated"];
    document.paths = {};

    const versionDir = resolve(dir, `openapi/${version.version}`);
    await mkdir(versionDir, { recursive: true });
    const outputFile = resolve(dir, `openapi/${version.version}/${name}.json`);
    const sortedDocument = sortOpenAPIDocument(document);
    await writeFile(outputFile, JSON.stringify(sortedDocument, null, 2), { encoding: "utf-8" });
  }
}
