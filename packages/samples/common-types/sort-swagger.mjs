import fs from "fs";

import { sortOpenAPIDocument } from "@azure-tools/typespec-autorest";
import path from "path";
import swaggerParser from "swagger-parser";

// Define the top-level nodes that need their subsections sorted
const sectionsToSort = ["definitions", "paths", "parameters"];

// Function to load and parse the Swagger JSON file
async function loadSwagger(filePath) {
  try {
    const api = await swaggerParser.bundle(filePath);
    return api;
  } catch (err) {
    console.error("Error parsing Swagger file:", err);
    return null;
  }
}

// Function to write sorted JSON to a file
function writeSortedSwagger(api, outputPath) {
  const sortedApi = sortOpenAPIDocument(api);
  const sortedJson = JSON.stringify(sortedApi, null, 2);
  fs.writeFileSync(outputPath, sortedJson);
  console.log("Sorted Swagger JSON saved to " + outputPath);
}

// Function to process files in a directory recursively
async function processDirectory(directoryPath, outputDir, baseDir) {
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        await processDirectory(filePath, outputDir, baseDir);
      } else if (path.extname(file) === ".json") {
        const relativePath = path.relative(baseDir, filePath);
        const outputFileName = path.join(outputDir, relativePath);
        const outputFileDir = path.dirname(outputFileName);
        fs.mkdirSync(outputFileDir, { recursive: true });

        const swaggerApi = await loadSwagger(filePath);
        if (swaggerApi) {
          writeSortedSwagger(swaggerApi, outputFileName);
        }
      }
    }
  } catch (err) {
    console.error("Error processing directory:", err);
  }
}

// Main function
async function main() {
  const inputDir = process.argv[2];
  const outputDir = process.argv[3] || inputDir;

  if (!inputDir) {
    console.error("Usage: node sort-swagger.mjs <input-directory> [output-directory]");
    process.exit(1);
  }

  await processDirectory(inputDir, outputDir, inputDir);
}

main();
