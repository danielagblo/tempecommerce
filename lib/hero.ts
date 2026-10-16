export type HeroFilm = {
  id: string;
  label: string;
  src: string;
  poster: string;
  productId: string | null;
  shown: boolean;
};

export const HERO_EVENT = "oriel-hero";

const HERO_KEY = "oriel-hero";
const DB_NAME = "oriel-hero";
const DB_STORE = "files";

const DEFAULTS: HeroFilm[] = [
  { id: "film-1", label: "Film 1", src: "/hero.mp4", poster: "/hero-1.jpg", productId: null, shown: true },
  { id: "film-2", label: "Film 2", src: "/hero-3.mp4", poster: "/hero-3.jpg", productId: null, shown: true },
  { id: "film-3", label: "Film 3", src: "/hero-2.mp4", poster: "/hero-2.jpg", productId: null, shown: true },
  { id: "film-4", label: "Film 4", src: "/hero-4.mp4", poster: "/hero-4.jpg", productId: null, shown: true },
  { id: "film-5", label: "Film 5", src: "/hero-5.mp4", poster: "/hero-5.jpg", productId: null, shown: true },
  { id: "film-6", label: "Film 6", src: "/hero-6.mp4", poster: "/hero-6.jpg", productId: null, shown: true },
  { id: "film-7", label: "Film 7", src: "/hero-7.mp4", poster: "/hero-7.jpg", productId: null, shown: true },
];

export function defaultHeroFilms(): HeroFilm[] {
  return DEFAULTS.map((film) => ({ ...film }));
}

function isFilm(value: unknown): value is HeroFilm {
  if (!value || typeof value !== "object") return false;
  const film = value as Partial<HeroFilm>;
  return (
    typeof film.id === "string" &&
    typeof film.label === "string" &&
    typeof film.src === "string" &&
    typeof film.poster === "string" &&
    (film.productId === null || typeof film.productId === "string") &&
    typeof film.shown === "boolean"
  );
}

export function sanitizeHeroFilms(value: unknown): HeroFilm[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isFilm);
}

export function readHeroFilms(): HeroFilm[] {
  if (typeof window === "undefined") return defaultHeroFilms();
  try {
    const raw = window.localStorage.getItem(HERO_KEY);
    if (!raw) return defaultHeroFilms();
    const films = sanitizeHeroFilms(JSON.parse(raw) as unknown);
    return films.length ? films : defaultHeroFilms();
  } catch {
    return defaultHeroFilms();
  }
}

export function filmsForHomepage(films: HeroFilm[]): HeroFilm[] {
  const shown = films.filter((film) => film.shown);
  if (shown.length) return shown;
  return films.length ? [films[0]] : defaultHeroFilms().slice(0, 1);
}

export function writeHeroFilms(films: HeroFilm[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HERO_KEY, JSON.stringify(films));
  window.dispatchEvent(new Event(HERO_EVENT));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) {
        request.result.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHeroBlob(id: string, file: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function readHeroBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const request = tx.objectStore(DB_STORE).get(id);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value instanceof Blob ? value : null);
    };
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function deleteHeroBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
