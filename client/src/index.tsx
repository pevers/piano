import * as _ from "./bootstrap";

import("./bootstrap").catch((e) =>
  console.error("Error importing `bootstrap.tsx`:", e)
);
