/**
 * @file lint.ts
 * @description Lint the codebase using Biome
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Uses Biome for fast linting (compatible with Bun)
 * - Checks for common errors and code style issues
 * - Auto-fixable issues are automatically fixed
 *
 * @todo
 * - [ ] Add CI/CD integration for linting
 * - [ ] Configure custom rules based on project needs
 */

const { spawn } = await import("node:child_process");

/**
 * Run Biome linter on the codebase
 */
async function lint() {
  console.log("Running Biome linter...\n");

  const lintProcess = spawn("bun", ["x", "biome", "check", "./src", "./index.ts"], {
    stdio: "inherit",
    shell: true,
  });

  return new Promise<number>((resolve) => {
    lintProcess.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

/**
 * Run Biome linter with auto-fix
 */
async function lintFix() {
  console.log("Running Biome linter with auto-fix...\n");

  const lintProcess = spawn("bun", ["x", "biome", "check", "--write", "./src", "./index.ts"], {
    stdio: "inherit",
    shell: true,
  });

  return new Promise<number>((resolve) => {
    lintProcess.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

// Main execution
const args = process.argv.slice(2);
const shouldFix = args.includes("--fix") || args.includes("-f");

const exitCode = shouldFix ? await lintFix() : await lint();
process.exit(exitCode);
