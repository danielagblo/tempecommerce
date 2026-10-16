import { readStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();
  return Response.json({ films: store.films });
}
