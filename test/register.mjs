// Bootstrap loaded via `node --import`: registers the resolve hook for the test run.
// Kept separate from hooks.mjs because module hooks execute on a dedicated thread.
import { register } from "node:module";

register("./hooks.mjs", import.meta.url);
