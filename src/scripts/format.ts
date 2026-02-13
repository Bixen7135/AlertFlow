/**
 * @file format.ts
 * @description Format the codebase using Biome formatter
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Uses Biome for fast formatting (compatible with Bun)
 * - Consistent code style across the project
 * - Can check formatting without writing (use --check)
 *
 * @todo
 * - [ ] Add pre-commit hook for formatting
 * - [ ] Configure formatting rules in biome.json
 */

const { spawn } = await import("node:child_process");

/**
 * Format the codebase with Biome
 */
async function format() {
  console.log("Formatting codebase with Biome...\n");

  const formatProcess = spawn("bun", ["x", "biome", "format", "--write", "./src", "./index.ts"], {
    stdio: "inherit",
    shell: true,
  });

  return new Promise<number>((resolve) => {
    formatProcess.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

/**
 * Check formatting without writing
 */
async function formatCheck() {
  console.log("Checking code formatting...\n");

  const formatProcess = spawn("bun", ["x", "biome", "format", "--check", "./src", "./index.ts"], {
    stdio: "inherit",
    shell: true,
  });

  return new Promise<number>((resolve) => {
    formatProcess.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

// Main execution
const args = process.argv.slice(2);
const shouldCheck = args.includes("--check") || args.includes("-c");

const exitCode = shouldCheck ? await formatCheck() : await format();
process.exit(exitCode);
