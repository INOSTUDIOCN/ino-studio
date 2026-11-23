export type ActionResult =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string };
