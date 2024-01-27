import { create } from "./index.js";

for (const module of ["esm", "cjs"]) {
  for (const view of [null, "pug", "ejs", "hbs"]) {
    for (const postcss of [null, "postcss", "tw"]) {
      let name = [module, view || "html", postcss].filter((x) => x).join("-");

      create("tests/" + name, {
        name,
        module: module as "esm" | "cjs",
        view: view as "pug" | "ejs" | "hbs" | null,
        postcss: postcss as "postcss" | "tw" | null,
        pm: "npm",
      }).then(() => console.log(name, "finished"));
    }
  }
}
