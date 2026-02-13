/**
 * @file issues.ts
 * @description Manage ISSUES.md state file for blockers and problems
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Append issues to ISSUES.md
 * - Use when debugging or encountering blockers
 * - Track investigations and resolutions
 *
 * @todo
 * - [ ] Add issue listing functionality
 * - [ ] Add issue close/resolution tracking
 */

const { existsSync, appendFileSync, readFileSync } = await import("node:fs");
const { resolve } = await import("node:path");

const ISSUES_MD_PATH = resolve(process.cwd(), "ISSUES.md");

/**
 * Append issue to ISSUES.md
 */
function appendIssue(issue: string): void {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  const time = timestamp.split("T")[1].split(".")[0];

  if (!existsSync(ISSUES_MD_PATH)) {
    // Create file with header
    appendFileSync(
      ISSUES_MD_PATH,
      `# ISSUES

**Project State Tracking - Blockers & Problems**

---

## ${date}

---
`
    );
  }

  const content = readFileSync(ISSUES_MD_PATH, "utf-8");
  const needsDateHeader = !content.includes(`## ${date}`);

  if (needsDateHeader) {
    appendFileSync(ISSUES_MD_PATH, `\n## ${date}\n\n---\n\n`);
  }

  appendFileSync(ISSUES_MD_PATH, `**${time}** ${issue}\n`);
  console.log(`✅ Logged to ISSUES.md`);
}

/**
 * Display issues from ISSUES.md
 */
function displayIssues(): void {
  if (!existsSync(ISSUES_MD_PATH)) {
    console.log("📋 ISSUES.md not found. No issues tracked yet.\n");
    return;
  }

  const content = readFileSync(ISSUES_MD_PATH, "utf-8");
  const lines = content.split("\n");

  console.log("📋 ISSUES.md - Recent Issues");
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

  // Handle adding issue
  if (args.includes("--add") || args.includes("-a")) {
    const issue = args
      .filter((a, i) => !a.startsWith("--") && !a.startsWith("-") && i > 0)
      .join(" ");

    if (issue) {
      appendIssue(issue);
      return;
    }
  }

  // Display issues by default
  displayIssues();
}

main().catch(console.error);
