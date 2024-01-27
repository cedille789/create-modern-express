#!/usr/bin/env node
import * as p from "@clack/prompts";
import { bold, cyan, grey } from "kleur/colors";
import fs from "node:fs";
import path from "node:path";
import { create } from "./index.js";

const { version } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8")
);
let cwd = process.argv[2] || ".";

console.log(`
${grey(`create-modern-express version ${version}`)}
`);

p.intro("Welcome to create-modern-express!");

if (cwd === ".") {
  const dir = await p.text({
    message: "Where should we create your project?",
    placeholder: "  (hit Enter to use current directory)",
  });

  if (p.isCancel(dir)) process.exit(1);

  if (dir) {
    cwd = dir;
  }
}

if (fs.existsSync(cwd)) {
  if (fs.readdirSync(cwd).length > 0) {
    const force = await p.confirm({
      message: "Directory not empty. Continue?",
      initialValue: false,
    });

    // bail if `force` is `false` or the user cancelled with Ctrl-C
    if (force !== true) {
      process.exit(1);
    }
  }
}

const options = await p.group(
  {
    module: () =>
      p.select({
        message: "Select a module system:",
        initialValue: "esm" as "esm" | "cjs",
        options: [
          { label: "ES Modules (import/export)", value: "esm" },
          { label: "CommonJS (require/exports)", value: "cjs" },
        ],
      }),

    view: () =>
      p.select({
        message: "Select a view engine",
        initialValue: "pug" as "pug" | "ejs" | "hbs" | null,
        options: [
          { label: "Plain HTML without view engine", value: null },
          { label: "Pug (Jade)", value: "pug" },
          { label: "EJS", value: "ejs" },
          { label: "Handlebars", value: "hbs" },
        ],
      }),

    postcss: () =>
      p.select({
        message: "Use PostCSS?",
        initialValue: null as "postcss" | "tw" | null,
        options: [
          { label: "No", value: null },
          { label: "Yes, with TailwindCSS", value: "tw" },
          { label: "Yes, without TailwindCSS", value: "postcss" },
        ],
      }),

    pm: () =>
      p.select({
        message: "Select a package manager",
        initialValue: "npm" as "npm" | "yarn" | "pnpm",
        options: [
          { label: "NPM", value: "npm" },
          { label: "Yarn", value: "yarn" },
          { label: "PNPM", value: "pnpm" },
        ],
      }),
  },
  { onCancel: () => process.exit(1) }
);

const spinner = p.spinner();
spinner.start("Creating project");

await create(cwd, {
  name: path.basename(path.resolve(cwd)),
  ...options,
});

spinner.stop("Created project successfully");
p.outro("Your project is ready!");

console.log("\nNext steps:");
let i = 1;

const relative = path.relative(process.cwd(), cwd);
if (relative !== "") {
  console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
}

console.log(`  ${i++}: ${bold(cyan(`${options.pm} install`))}`);
console.log(
  `  ${i++}: ${bold(
    cyan('git init && git add -A && git commit -m "Initial commit"')
  )} (optional)`
);
console.log(`  ${i++}: ${bold(cyan(`${options.pm} run dev`))}`);

console.log(`\nTo close the dev server, hit ${bold(cyan("Ctrl-C"))}`);
