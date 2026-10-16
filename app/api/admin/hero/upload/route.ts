import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/server/auth";

const MAX_BYTES = 40 * 1024 * 1024;

function uploadName(src: string): string | null {
  const match = src.match(/^\/hero-uploads\/([a-zA-Z0-9.-]+)$/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  if (!isAdmin()) return Response.json({ error: "Sign in required." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a video." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That video is too large." }, { status: 400 });
  const id = `film-${crypto.randomUUID()}`;
  const filename = `${id}.mp4`;
  const folder = path.join(process.cwd(), "public", "hero-uploads");
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, filename), Buffer.from(await file.arrayBuffer()));
  return Response.json({ id, src: `/hero-uploads/${filename}` });
}

export async function DELETE(request: Request) {
  if (!isAdmin()) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { src?: unknown } | null;
  const name = typeof body?.src === "string" ? uploadName(body.src) : null;
  if (!name) return Response.json({ ok: true });
  await fs.unlink(path.join(process.cwd(), "public", "hero-uploads", name)).catch(() => {});
  return Response.json({ ok: true });
}
