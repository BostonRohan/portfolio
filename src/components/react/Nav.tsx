import { theme as themeStore } from "../../store";
import { useEffect, useRef, useState } from "react";

interface NowPlayingTrack {
  name: string;
  artist: string;
  album: string;
  url: string;
}

const sanitizedTextCache = new Map<string, string>();

async function fetchSanitizedText(input: string) {
  if (!input) return input;
  if (sanitizedTextCache.has(input)) {
    return sanitizedTextCache.get(input)!;
  }

  try {
    const response = await fetch(`https://www.purgomalum.com/service/json?text=${encodeURIComponent(input)}`);
    if (!response.ok) {
      return input;
    }

    const json = await response.json();
    const sanitized = json?.result ?? input;
    sanitizedTextCache.set(input, sanitized);
    return sanitized;
  } catch {
    return input;
  }
}

export default function Nav({
  currentPath,
}: {
  currentPath: string;
}) {
  const handleClick = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      themeStore.set("dark");
      localStorage.removeItem("theme");
      document.documentElement.classList.add("dark");
    } else {
      themeStore.set("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  const [scrollPosition, setPosition] = useState<number>(0);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const mobileMusicRef = useRef<HTMLDivElement | null>(null);
  const isHome = currentPath === "/";
  const [sanitizedTrack, setSanitizedTrack] = useState("");
  const [sanitizedArtist, setSanitizedArtist] = useState("");

  useEffect(() => {
    function updatePosition() {
      setPosition(window.scrollY);
    }

    window.addEventListener("scroll", updatePosition);
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadNowPlaying() {
      try {
        const response = await fetch("/api/now-playing");
        if (!response.ok) return;

        const json = await response.json();
        if (!isMounted) return;
        setNowPlaying(json?.track || null);
        if (!json?.track) {
          setIsMusicOpen(false);
        }
      } catch {
        if (isMounted) {
          setNowPlaying(null);
          setIsMusicOpen(false);
        }
      }
    }

    void loadNowPlaying();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!nowPlaying) {
      setSanitizedTrack("");
      setSanitizedArtist("");
      return;
    }

    setSanitizedTrack(nowPlaying.name);
    setSanitizedArtist(nowPlaying.artist);

    let active = true;

    async function sanitizeNowPlaying() {
      const [track, artist] = await Promise.all([
        fetchSanitizedText(nowPlaying.name),
        fetchSanitizedText(nowPlaying.artist),
      ]);
      if (!active) return;
      setSanitizedTrack(track || nowPlaying.name);
      setSanitizedArtist(artist || nowPlaying.artist);
    }

    void sanitizeNowPlaying();

    return () => {
      active = false;
    };
  }, [nowPlaying]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!mobileMusicRef.current) return;
      if (mobileMusicRef.current.contains(event.target as Node)) return;
      setIsMusicOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMusicOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const safeTrackName = sanitizedTrack || (nowPlaying ? nowPlaying.name : "");
  const safeArtistName = sanitizedArtist || (nowPlaying ? nowPlaying.artist : "");

  return (
    <nav
      className={`m-auto w-full z-20 rounded-xl px-4 mb-8 sticky top-4 transition border ${scrollPosition < 1 ? "bg-transparent border-transparent" : "bg-slate-200/50 dark:bg-zinc-950/40 backdrop-blur-2xl border-slate-300/60 dark:border-zinc-800"}`}
      id="nav"
    >
      <div className="flex items-center justify-between mx-auto">
        <div className="flex justify-center gap-4 items-center w-full min-h-14 py-2 mx-auto sm:text-left text-center">
          <a
            href="/"
            className="rounded-lg font-semibold hover:dark:text-neutral-300 hover:text-neutral-700 dark:text-neutral-50 sm:text-base text-sm"
          >
            Boston Rohan
          </a>

          {isHome && nowPlaying && (
            <>
              <a
                href={nowPlaying.url}
                target="_blank"
                rel="noreferrer"
                className="music-now-playing hidden md:flex items-center gap-2 ml-3 px-2.5 py-1 text-xs text-left transition"
                aria-label={`Currently listening to ${safeTrackName} by ${safeArtistName}`}
              >
                <span className="music-note-cloud" aria-hidden="true">
                  <span className="music-note-track">
                    <span className="music-note music-note-one">♪</span>
                    <span className="music-note music-note-two">♫</span>
                    <span className="music-note music-note-three">♪</span>
                  </span>
                </span>
                <span className="music-now-playing-copy">
                  <span className="music-now-playing-label">Listening</span>
                  <span className="truncate max-w-[12rem]">
                    {safeTrackName} - {safeArtistName}
                  </span>
                </span>
              </a>
              <div className="relative flex md:hidden ml-2" ref={mobileMusicRef}>
                <button
                  type="button"
                  className="music-now-playing music-now-playing-mobile flex items-center justify-center transition"
                  aria-label={`Currently listening to ${safeTrackName} by ${safeArtistName}`}
                  aria-expanded={isMusicOpen}
                  aria-haspopup="dialog"
                  onClick={() => setIsMusicOpen((current) => !current)}
                >
                  <span className="music-note-cloud music-note-cloud-mobile" aria-hidden="true">
                    <span className="music-note-track">
                      <span className="music-note music-note-one">♪</span>
                      <span className="music-note music-note-two">♫</span>
                      <span className="music-note music-note-three">♪</span>
                    </span>
                  </span>
                </button>
                {isMusicOpen && (
                  <div
                    className="music-popover music-popover-mobile absolute left-1/2 top-[calc(100%+0.5rem)] w-52 max-w-[calc(100vw-1rem)] rounded-2xl px-3 py-2 text-left"
                    role="dialog"
                    aria-label="Current song"
                  >
                    <p className="music-popover-label">Listening now</p>
                    <p className="music-popover-title">{safeTrackName}</p>
                    <p className="music-popover-meta">{safeArtistName}</p>
                    <a
                      href={nowPlaying.url}
                      target="_blank"
                      rel="noreferrer"
                      className="music-popover-link"
                    >
                      Open track
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="ml-auto flex flex-row-reverse items-center">
            <button
              className="relative w-8 h-8 flex items-center justify-center"
              aria-label="Light/Dark Mode Button Toggle"
              onClick={handleClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#d29922"
                className="bi bi-moon-fill dark:hidden"
                viewBox="0 0 16 16"
              >
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path>
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#fde047"
                className="bi bi-brightness-high-fill hidden dark:block"
                viewBox="0 0 16 16"
              >
                <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path>
              </svg>
            </button>
            <a
              href="#contact"
              id="name"
              type="button"
              className={`mr-4 sm:border sm:no-underline underline rounded-2xl transition sm:p-1.5 sm:text-sm text-xs flex items-center justify-center dark:hover:bg-neutral-400/15 hover:bg-slate-200 ${isHome ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              Let's connect
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
