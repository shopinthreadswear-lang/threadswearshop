import { destroySession } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";

export const POST = handle(async () => {
  await destroySession();
  return ok({});
});
