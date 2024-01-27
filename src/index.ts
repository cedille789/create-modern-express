import ejs from "ejs";
import fs from "fs/promises";
import { fileURLToPath } from "url";

export interface Option {
  name: string;
  module: "esm" | "cjs";
  view: "pug" | "ejs" | "hbs" | null;
  postcss: "postcss" | "tw" | null;
  pm: "npm" | "yarn" | "pnpm";
}

export async function create(cwd: string, options: Option) {
  await mkdirp(cwd);

  await createPackageJSON(cwd, options);
  await createBase(cwd);
  await createCSS(cwd, options);
  await createJS(cwd, options);
  await createViews(cwd, options);
}

async function createViews(cwd: string, option: Option) {
  const { view } = option;

  if (!view) {
    return await copyAndRenderEJS(
      cwd,
      "views/index.html",
      "public/index.html",
      option
    );
  }

  await mkdirp(`${cwd}/views`);

  for (const filename of ["layout", "index", "error"]) {
    if (view == "ejs" && filename == "layout") continue;

    await copyAndRenderEJS(
      cwd,
      `views/${filename}.${view}`,
      `views/${filename}.${view}`,
      option
    );
  }
}

async function createJS(cwd: string, options: Option) {
  await copyAndRenderEJS(cwd, js(options, "js/app"), "app.js", options);
  await copyAndRenderEJS(
    cwd,
    js(options, "js/index"),
    "routes/index.js",
    options
  );
  await copyAndRenderEJS(cwd, js(options, "js/www"), "bin/www.js", options);
}

async function createCSS(cwd: string, options: Option) {
  await copyAndRenderEJS(cwd, "css/style.css", "public/css/style.css", {
    tw: options.postcss == "tw",
  });

  if (!options.postcss) return;

  await copyAndRenderEJS(cwd, "css/.postcssrc.yaml", ".postcssrc.yaml", {
    tw: options.postcss == "tw",
  });

  if (options.postcss == "tw") {
    await copyAndRenderEJS(
      cwd,
      js(options, "css/tailwind.config"),
      "tailwind.config.js",
      options
    );
  }
}

async function createBase(cwd: string) {
  await fs.cp(dist("templates/base"), cwd, { recursive: true });
  await fs.rename(`${cwd}/gitignore`, `${cwd}/.gitignore`);
  await mkdirp(`${cwd}/bin`);
  await mkdirp(`${cwd}/public/images`);
  await mkdirp(`${cwd}/public/css`);
  await mkdirp(`${cwd}/public/js`);
  await mkdirp(`${cwd}/routes`);
}

async function createPackageJSON(
  cwd: string,
  { name, module, view, postcss }: Option
) {
  const pkg: Record<string, any> = {
    name,
    version: "0.0.0",
    private: true,
    scripts: {
      start: "node ./bin/www.js",
    },
  };

  // type: "module"
  if (module == "esm") pkg.type = "module";

  // scripts
  if (postcss) {
    pkg.scripts = {
      ...pkg.scripts,
      "postcss:build":
        "postcss --env=production ./public/css/style.css -o ./public/css/dist/style.css",
      "postcss:watch":
        "postcss ./public/css/style.css -o ./public/css/dist/style.css -w",
    };
  }

  // dependencies
  const dependencies: Record<string, any> = {
    "cookie-parser": "^1.4.6",
    debug: "^4.3.4",
    dotenv: "^16.4.1",
    express: "^4.18.2",
    morgan: "^1.10.0",
  };

  if (view) {
    dependencies["http-errors"] = "^2.0.0";
    dependencies[view] = {
      pug: "^3.0.2",
      ejs: "^3.1.9",
      hbs: "^4.2.0",
    }[view];
  }

  pkg.dependencies = sort_keys(dependencies);

  // devDependencies
  if (postcss) {
    pkg.devDependencies = {
      autoprefixer: "^10.4.17",
      postcss: "^8.4.33",
      "postcss-cli": "^11.0.0",
    };

    if (postcss == "tw") {
      pkg.devDependencies.tailwindcss = "^3.4.1";
    }
  }

  // write package.json
  await fs.writeFile(
    `${cwd}/package.json`,
    JSON.stringify(pkg, null, 2),
    "utf-8"
  );
}

function js(options: Option, filename: string) {
  return `${filename}.${options.module == "esm" ? "js" : "cjs"}`;
}

async function copyAndRenderEJS(
  cwd: string,
  src: string,
  dest: string,
  data: ejs.Data
) {
  await fs.copyFile(dist(`templates/${src}`), `${cwd}/${dest}`);
  ejs.renderFile(`${cwd}/${dest}`, data, (err, str) => {
    fs.writeFile(`${cwd}/${dest}`, str, "utf-8");
  });
}

function sort_keys(obj: Record<string, any>) {
  const sorted: Record<string, any> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });

  return sorted;
}

export async function mkdirp(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e: any) {
    if (e.code === "EEXIST") return;
    throw e;
  }
}

export function dist(path: string): string {
  return fileURLToPath(new URL(`../${path}`, import.meta.url).href);
}
