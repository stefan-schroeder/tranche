// Zero-dep ESM resolve hook so `node --test` (Node's native TS type-stripping) can run
// the suite without a transpiler or extra deps. Two jobs:
//   1. extensionless relative imports (`./x`, `../x`) -> append `.ts`. The source uses
//      bundler-style extensionless imports; native ESM has no extension search.
//   2. `@/foo` path alias -> `<cwd>/src/foo.ts` (mirrors tsconfig `paths`).
// Anything else is delegated to the default resolver untouched.
import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const url = pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}.ts`).href;
    return nextResolve(url, context);
  }
  if (/^\.\.?\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
