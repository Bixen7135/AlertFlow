/**
 * @file decisions.ts
 * @description Manage DECISIONS.md state file for architectural choices
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Append decisions to DECISIONS.md
 * - Use when making architectural or structural decisions
 * - Track trade-offs and rationale
 *
 * @todo
 * - [ ] Add decision listing functionality
 * - [ ] Add decision impact tracking
 */

const { existsSync, appendFileSync, readFileSync } = await import("node:fs");
const { resolve } = await import("node:path");

const DECISIONS_MD_PATH = resolve(process.cwd(), "DECISIONS.md");

/**
 * Append decision to DECISIONS.md
 */
function appendDecision(decision: string): void {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  const time = timestamp.split("T")[1].split(".")[0];

  if (!existsSync(DECISIONS_MD_PATH)) {
    // Create file with header
    appendFileSync(
      DECISIONS_MD_PATH,
      `# DECISIONS

**Project State Tracking - Architectural & Structural Decisions**

---

## ${date}

---
`
    );
  }

  const content = readFileSync(DECISIONS_MD_PATH, "utf-8");
  const needsDateHeader = !content.includes(`## ${date}`);

  if (needsDateHeader) {
    appendFileSync(DECISIONS_MD_PATH, `\n## ${date}\n\n---\n\n`);
  }

  appendFileSync(DECISIONS_MD_PATH, `**${time}** ${decision}\n`);
  console.log(`✅ Logged to DECISIONS.md`);
}

/**
 * Display decisions from DECISIONS.md
 */
function displayDecisions(): void {
  if (!existsSync(DECISIONS_MD_PATH)) {
    console.log("📋 DECISIONS.md not found. No decisions tracked yet.\n");
    return;
  }

  const content = readFileSync(DECISIONS_MD_PATH, "utf-8");
  const lines = content.split("\n");

  console.log("📋 DECISIONS.md - Recent Decisions");
  console.log("─".repeat(60) + "\n");

  // Show last 30 lines
  const recentLines = lines.slice(-30);

  for (const line of recentLines) {
    console.log(line);
  }

  console.log("");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Handle adding decision
  if (args.includes("--add") || args.includes("-a")) {
    const decision = args
      .filter((a, i) => !a.startsWith("--") && !a.startsWith("-") && i > 0)
      .join(" ");

    if (decision) {
      appendDecision(decision);
      return;
    }
  }

  // Display decisions by default
  displayDecisions();
}

main().catch(console.error);
