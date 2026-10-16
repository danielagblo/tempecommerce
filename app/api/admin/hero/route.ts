import { isAdmin } from "@/lib/server/auth";
import { saveStoredFilms } from "@/lib/server/store";
import { sanitizeHeroFilms } from "@/lib/hero";

export async function PUT(request: Request) {
  if (!isAdmin()) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { films?: unknown } | null;
  const films = sanitizeHeroFilms(body?.films);
  if (!films.length) return Response.json({ error: "Keep at least one film." }, { status: 400 });
  const saved = await saveStoredFilms(films);
  return Response.json({ films: saved });
}
