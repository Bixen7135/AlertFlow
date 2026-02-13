/**
 * @file progress.ts
 * @description Display project progress, stats, and development overview
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Shows project statistics (files, lines of code, TODOs)
 * - Displays recent changes and work status
 * - Reads from PROGRESS.md state file
 * - Provides overview of development progress
 *
 * @changelog
 * - 2025-02-12: Added integration with PROGRESS.md state file
 * - 2025-02-12: Initial file creation
 *
 * @todo
 * - [ ] Add git commit history summary
 * - [ ] Track time spent on features
 * - [ ] Generate progress reports
 */

const { readdirSync, readFileSync, existsSync, appendFileSync } = await import("node:fs");
const { join, extname, resolve } = await import("node:path");

interface ProjectStats {
  totalFiles: number;
  totalLines: number;
  totalCodeLines: number;
  totalCommentLines: number;
  filesByExtension: Record<string, number>;
  todosByPriority: Record<string, number>;
}

const PROGRESS_MD_PATH = resolve(process.cwd(), "PROGRESS.md");

/**
 * Read and display progress from PROGRESS.md
 */
function displayProgressMd(): void {
  if (!existsSync(PROGRESS_MD_PATH)) {
    console.log("📋 PROGRESS.md not found. Start logging progress to track work.\n");
    return;
  }

  const content = readFileSync(PROGRESS_MD_PATH, "utf-8");
  const lines = content.split("\n");

  console.log("📋 PROGRESS.md - Recent Log");
  console.log("─".repeat(60) + "\n");

  // Show last 30 lines
  const recentLines = lines.slice(-30);

  for (const line of recentLines) {
    console.log(line);
  }

  console.log("");
}

/**
 * Append entry to PROGRESS.md
 */
function appendToProgress(entry: string): void {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  const time = timestamp.split("T")[1].split(".")[0];

  if (!existsSync(PROGRESS_MD_PATH)) {
    // Create file with header
    appendFileSync(
      PROGRESS_MD_PATH,
      `# PROGRESS

**Project State Tracking - Progress Log**

---

## ${date}

---
`
    );
  }

  appendFileSync(PROGRESS_MD_PATH, `**${time}** ${entry}\n`);
  console.log(`✅ Logged to PROGRESS.md`);
}

/**
 * Get all source files recursively
 */
function getSourceFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".turbo"].includes(entry.name)) {
        files.push(...getSourceFiles(fullPath, baseDir));
      }
    } else if (
      [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md"].includes(
        extname(entry.name)
      )
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Calculate project statistics
 */
function calculateStats(files: string[]): ProjectStats {
  const stats: ProjectStats = {
    totalFiles: files.length,
    totalLines: 0,
    totalCodeLines: 0,
    totalCommentLines: 0,
    filesByExtension: {},
    todosByPriority: {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    },
  };

  for (const file of files) {
    const ext = extname(file);
    stats.filesByExtension[ext] = (stats.filesByExtension[ext] || 0) + 1;

    try {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");

      stats.totalLines += lines.length;

      let inComment = false;

      for (const line of lines) {
        const trimmed = line.trim();

        // Check for TODO comments
        const todoMatch = trimmed.match(/\/\/\s*TODO:\s*\[?(\w+)\]?\s*/);
        if (todoMatch) {
          const priority = todoMatch[1].toUpperCase();
          if (["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(priority)) {
            stats.todosByPriority[priority]++;
          } else {
            stats.todosByPriority.MEDIUM++;
          }
        }

        // Count comment lines
        if (trimmed.startsWith("/*") || trimmed.startsWith("*")) {
          inComment = true;
        }
        if (inComment || trimmed.startsWith("//")) {
          stats.totalCommentLines++;
        }
        if (trimmed.includes("*/")) {
          inComment = false;
          continue;
        }
        if (trimmed && !inComment && !trimmed.startsWith("//")) {
          stats.totalCodeLines++;
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return stats;
}

/**
 * Display statistics with formatting
 */
function displayStats(stats: ProjectStats): void {
  console.log("═".repeat(60));
  console.log("📊 PROJECT STATISTICS");
  console.log("═".repeat(60) + "\n");

  console.log("📁 Files:");
  console.log(`   Total: ${stats.totalFiles}`);
  for (const [ext, count] of Object.entries(stats.filesByExtension)) {
    console.log(`   ${ext || "(no extension)"}: ${count}`);
  }

  console.log("\n📝 Lines of Code:");
  console.log(`   Total Lines: ${stats.totalLines}`);
  console.log(`   Code Lines: ${stats.totalCodeLines}`);
  console.log(`   Comment Lines: ${stats.totalCommentLines}`);
  console.log(`   Code/Comment Ratio: ${(stats.totalCodeLines / Math.max(stats.totalCommentLines, 1)).toFixed(2)}`);

  const totalTodos = Object.values(stats.todosByPriority).reduce((a, b) => a + b, 0);
  console.log("\n✅ TODO Status:");
  console.log(`   🔴 CRITICAL: ${stats.todosByPriority.CRITICAL}`);
  console.log(`   🟡 HIGH: ${stats.todosByPriority.HIGH}`);
  console.log(`   🔵 MEDIUM: ${stats.todosByPriority.MEDIUM}`);
  console.log(`   ⚪ LOW: ${stats.todosByPriority.LOW}`);
  console.log(`   Total: ${totalTodos}`);

  console.log("\n" + "═".repeat(60));

  if (stats.todosByPriority.CRITICAL > 0) {
    console.log(`⚠️  ${stats.todosByPriority.CRITICAL} CRITICAL TODO(s) need attention!`);
  }
  console.log("═".repeat(60) + "\n");
}

/**
 * Get recent git activity (if available)
 */
async function getGitActivity(): Promise<void> {
  const { spawn } = await import("node:child_process");

  return new Promise((resolve) => {
    const gitProcess = spawn("git", ["log", "-5", "--oneline", "--format=%h %s (%ar)"], {
      stdio: ["ignore", "pipe", "ignore"],
      shell: true,
    });

    let output = "";

    gitProcess.stdout?.on("data", (data) => {
      output += data.toString();
    });

    gitProcess.on("close", (code) => {
      if (code === 0 && output.trim()) {
        console.log("🕐 Recent Activity:");
        output.trim().split("\n").forEach((line: string) => {
          console.log(`   ${line}`);
        });
        console.log("");
      }
      resolve();
    });

    gitProcess.on("error", () => {
      resolve(); // Git not available, skip
    });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Handle adding progress entry
  if (args.includes("--add") || args.includes("-a")) {
    const entry = args
      .filter((a, i) => !a.startsWith("--") && !a.startsWith("-") && i > 0)
      .join(" ");

    if (entry) {
      appendToProgress(entry);
      return;
    }
  }

  // Display progress from PROGRESS.md
  displayProgressMd();

  const files = getSourceFiles(process.cwd());
  const stats = calculateStats(files);

  displayStats(stats);

  try {
    await getGitActivity();
  } catch {
    // Git not available
  }
}

main().catch(console.error);
