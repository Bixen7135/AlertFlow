/**
 * @file todo.ts
 * @description Search and display all TODO comments in codebase and TODO.md
 * @author Claude & User
 * @created 2025-02-12
 *
 * @notes
 * - Scans all TypeScript/JavaScript files for TODO comments
 * - Reads and displays tasks from TODO.md state file
 * - Groups by priority (CRITICAL, HIGH, MEDIUM, LOW)
 * - Shows file path and line number for easy navigation
 *
 * @changelog
 * - 2025-02-12: Added integration with TODO.md state file
 * - 2025-02-12: Initial file creation
 *
 * @todo
 * - [ ] Add filtering by priority
 * - [ ] Add export to markdown file
 * - [ ] Integrate with GitHub issues
 */

const { readdirSync, readFileSync, existsSync, appendFileSync } = await import("node:fs");
const { join, extname, resolve } = await import("node:path");

interface TodoItem {
  file: string;
  line: number;
  priority: string;
  text: string;
  source: "code" | "state";
}

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const TODO_MD_PATH = resolve(process.cwd(), "TODO.md");

/**
 * Parse tasks from TODO.md state file
 */
function parseTodoMd(): TodoItem[] {
  const todos: TodoItem[] = [];

  if (!existsSync(TODO_MD_PATH)) {
    return todos;
  }

  const content = readFileSync(TODO_MD_PATH, "utf-8");
  const lines = content.split("\n");

  let currentSection = "";
  let currentDate = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track date sections
    const dateMatch = line.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      currentDate = dateMatch[1];
      continue;
    }

    // Track priority sections
    const priorityMatch = line.match(/^###\s+(CRITICAL|HIGH|MEDIUM|LOW)/);
    if (priorityMatch) {
      currentSection = priorityMatch[1];
      continue;
    }

    // Parse task items
    const taskMatch = line.match(/-\s*\[([ x])\]\s*(.+)/);
    if (taskMatch && currentSection) {
      const status = taskMatch[1];
      const text = taskMatch[2];

      // Only show pending tasks
      if (status === " ") {
        todos.push({
          file: "TODO.md",
          line: i + 1,
          priority: currentSection,
          text,
          source: "state",
        });
      }
    }
  }

  return todos;
}

/**
 * Find all TypeScript/JavaScript files in a directory recursively
 */
function findSourceFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and dist directories
      if (!["node_modules", "dist", ".git"].includes(entry.name)) {
        files.push(...findSourceFiles(fullPath, baseDir));
      }
    } else if (
      [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse TODO comments from a file
 */
function parseTodos(filePath: string): TodoItem[] {
  const todos: TodoItem[] = [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const todoMatch = line.match(/\/\/\s*TODO:\s*\[?(\w+)\]?\s*(.+)/);

    if (todoMatch) {
      const priority = todoMatch[1].toUpperCase() || "MEDIUM";
      const text = todoMatch[2];

      todos.push({
        file: filePath,
        line: i + 1,
        priority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(priority)
          ? priority
          : "MEDIUM",
        text,
        source: "code",
      });
    }
  }

  return todos;
}

/**
 * Group todos by priority
 */
function groupTodosByPriority(todos: TodoItem[]): Record<string, TodoItem[]> {
  const grouped: Record<string, TodoItem[]> = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  };

  for (const todo of todos) {
    const p = todo.priority in grouped ? todo.priority : "MEDIUM";
    grouped[p].push(todo);
  }

  return grouped;
}

/**
 * Display todos with color coding
 */
function displayTodos(groupedTodos: Record<string, TodoItem[]>): void {
  let total = 0;

  // ANSI color codes for terminal
  const colors = {
    CRITICAL: "\x1b[31m", // Red
    HIGH: "\x1b[33m", // Yellow
    MEDIUM: "\x1b[36m", // Cyan
    LOW: "\x1b[90m", // Gray
    reset: "\x1b[0m",
  };

  const symbols = {
    CRITICAL: "🔴",
    HIGH: "🟡",
    MEDIUM: "🔵",
    LOW: "⚪",
  };

  for (const [priority, todos] of Object.entries(groupedTodos)) {
    if (todos.length > 0) {
      total += todos.length;
      const color = colors[priority as keyof typeof colors] || colors.reset;
      const symbol = symbols[priority as keyof typeof symbols] || "⚪";

      console.log(`\n${color}${symbol} ${priority} (${todos.length})${colors.reset}`);
      console.log(`${color}${"─".repeat(50)}${colors.reset}`);

      for (const todo of todos) {
        const relativePath = todo.file.replace(process.cwd() + "/", "");
        const sourceIndicator = todo.source === "state" ? " [📋 STATE]" : "";
        console.log(`  ${relativePath}:${todo.line}${sourceIndicator}`);
        console.log(`  ${todo.text.trim()}`);
        console.log("");
      }
    }
  }

  console.log(`\n${colors.reset}${"═".repeat(50)}`);
  console.log(`Total TODOs: ${total}${colors.reset}\n`);
}

/**
 * Add a new task to TODO.md
 */
function addTaskToTodoMd(priority: string, description: string): void {
  const timestamp = new Date().toISOString().split("T")[0];

  if (!existsSync(TODO_MD_PATH)) {
    // Create file with header
    appendFileSync(
      TODO_MD_PATH,
      `# TODO

**Project State Tracking - Tasks**

---

## ${timestamp}

`
    );
  }

  appendFileSync(TODO_MD_PATH, `- [ ] ${description}\n`);
  console.log(`✅ Added task to TODO.md: ${description}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Handle adding new tasks
  if (args.includes("--add") || args.includes("-a")) {
    const priorityIndex = args.findIndex((a) => a === "--priority" || a === "-p");
    const priority = priorityIndex !== -1 ? args[priorityIndex + 1]?.toUpperCase() : "MEDIUM";
    const description = args.filter(
      (a, i) => !a.startsWith("--") && !a.startsWith("-") && i > 0 && args[i - 1] !== priority
    ).join(" ");

    if (description) {
      addTaskToTodoMd(priority, description);
      return;
    }
  }

  console.log("\n🔍 Scanning for TODO comments...\n");

  // Get todos from both TODO.md and code
  const stateTodos = parseTodoMd();
  const sourceFiles = findSourceFiles(process.cwd());
  let codeTodos: TodoItem[] = [];

  for (const file of sourceFiles) {
    codeTodos.push(...parseTodos(file));
  }

  const allTodos = [...stateTodos, ...codeTodos];

  // Sort by priority
  allTodos.sort((a, b) =>
    (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99) -
    (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99)
  );

  const groupedTodos = groupTodosByPriority(allTodos);
  displayTodos(groupedTodos);
}

main().catch(console.error);
