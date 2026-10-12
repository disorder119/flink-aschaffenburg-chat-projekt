import type { Region } from "../types";
export function RiderVector({
  selected,
  onSelect,
}: {
  selected: Region | "all";
  onSelect: (r: Region) => void;
}) {
  const active = (r: Region) => (selected === r ? "selected" : "");
  const select = (r: Region) => (event: React.KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(r);
    }
  };
  return (
    <div className="vector-stage">
      <div className="stage-cross cross-one">+</div>
      <div className="stage-cross cross-two">+</div>
      <div className="stage-caption">SCHICHTBEREIT / ASCHAFFENBURG</div>
      <svg
        className="rider"
        viewBox="0 0 500 620"
        role="group"
        aria-label="Interaktiver Lieferfahrer. Wähle Kopf, Oberkörper, Hände, Beine oder Füße."
      >
        <defs>
          <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--rider-light)" />
            <stop offset=".5" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--rider-dark)" />
          </linearGradient>
          <linearGradient id="pants" x1="0" x2="1">
            <stop stopColor="#34413e" />
            <stop offset="1" stopColor="#1b2b28" />
          </linearGradient>
          <linearGradient id="helmet" x1="0" x2="1" y2="1">
            <stop stopColor="#e9ede1" />
            <stop offset=".5" stopColor="#bfcabd" />
            <stop offset="1" stopColor="#8f9e92" />
          </linearGradient>
          <linearGradient id="bag" x1="0" x2="1" y2="1">
            <stop stopColor="var(--rider-light)" />
            <stop offset="1" stopColor="var(--rider-dark)" />
          </linearGradient>
          <linearGradient id="boot" x1="0" x2="1">
            <stop stopColor="#57635b" />
            <stop offset="1" stopColor="#283931" />
          </linearGradient>
          <pattern
            id="grid"
            width="38"
            height="38"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M38 0H0V38"
              fill="none"
              stroke="#eeafcb"
              strokeWidth=".7"
              opacity=".18"
            />
          </pattern>
        </defs>
        <rect width="500" height="620" fill="url(#grid)" />
        <circle
          cx="254"
          cy="294"
          r="213"
          fill="none"
          stroke="#e9bad2"
          opacity=".45"
        />
        <circle
          cx="254"
          cy="294"
          r="174"
          fill="none"
          stroke="#e9bad2"
          strokeDasharray="3 9"
          opacity=".6"
        />
        <path d="M40 527H460" stroke="#e9bad2" strokeDasharray="4 5" />
        <ellipse
          cx="262"
          cy="558"
          rx="113"
          ry="15"
          fill="#253e32"
          opacity=".13"
        />
        {/* Original vector artwork; no brand marks or third-party images. */}
        <g
          className={`rider-part ${active("oberkoerper")}`}
          role="button"
          tabIndex={0}
          aria-label="Oberkörper auswählen"
          aria-pressed={selected === "oberkoerper"}
          onKeyDown={select("oberkoerper")}
          onClick={() => onSelect("oberkoerper")}
        >
          <title>Oberkörper: Jacken und Basisschichten</title>
          <path
            d="m314 175 36 20 13 115-17 18-64-23-10-124z"
            fill="url(#bag)"
            stroke="#7f442f"
            strokeWidth="2"
          />
          <path d="m314 178 31 17-2 112-26-10z" fill="var(--rider-bag)" />
          <path
            d="m346 205 12 5M343 281l17 5"
            stroke="#f0c69c"
            strokeWidth="6"
          />
          <path
            d="m202 165-24 16-23 58 8 61 24 10 12-38 8-43z"
            fill="url(#coat)"
            stroke="#6f3b5a"
            strokeWidth="2"
          />
          <path
            d="m296 168 26 20 17 57-4 64-27 7-7-53-20-28z"
            fill="url(#coat)"
            stroke="#6f3b5a"
            strokeWidth="2"
          />
          <path
            d="m207 159 23-13 52 4 28 29-6 126-10 38-89-4-14-41 5-107z"
            fill="url(#coat)"
            stroke="#6f3b5a"
            strokeWidth="2"
          />
          <path
            d="m209 175 24-22 48 6 18 30-6 17-33-7-25 2z"
            fill="var(--rider-light)"
          />
          <path
            d="m218 183 11-17 22 30-17 1zM253 195l27-32 17 20-28 22z"
            fill="#fff3fa"
          />
          <path d="m213 209 28 11 2 91-32 1z" fill="var(--accent)" />
          <path d="m262 219 28-11-3 104-27-1z" fill="var(--rider-dark)" />
          <path d="M253 196v138" stroke="#101f1b" strokeWidth="6" />
          <path d="M254 196v138" stroke="#a3b09e" strokeWidth="1.3" />
          <path
            d="m211 247 27 4M263 251l27-4"
            stroke="#132b22"
            strokeWidth="4"
          />
          <path
            d="m213 251 24 4M267 255l20-4"
            stroke="#97a889"
            strokeWidth="1"
          />
          <path d="m194 306 110 2-4 13-99-1z" fill="#fff3fa" />
          <path
            d="m163 273 24 7-4 12-22-7M309 285l28-5-1 12-26 5"
            fill="#fff3fa"
          />
          <path d="m289 164 12 11-28 55-9-8z" fill="#202f29" />
          <path
            d="m289 167 7 8-26 51"
            fill="none"
            stroke="#677368"
            strokeWidth="2"
          />
          <path
            d="m204 221-2 33M304 219l4 36M169 226l13 5M322 225l-12 8"
            stroke="#90a18c"
            opacity=".5"
            fill="none"
          />
        </g>
        <g
          className={`rider-part ${active("beine")}`}
          role="button"
          tabIndex={0}
          aria-label="Beine auswählen"
          aria-pressed={selected === "beine"}
          onKeyDown={select("beine")}
          onClick={() => onSelect("beine")}
        >
          <title>Beine: Hosen und Regenüberhosen</title>
          <path
            d="m209 331 45 4-1 63-17 96-9 39-33-3 8-40 6-90z"
            fill="url(#pants)"
            stroke="#172824"
            strokeWidth="2"
          />
          <path
            d="m253 335 42-4 10 65 4 99-1 38-34 2-8-38-14-102z"
            fill="url(#pants)"
            stroke="#172824"
            strokeWidth="2"
          />
          <path
            d="m211 339 16 6 1 57-16 36-7-3 12-39zM284 342l8 56 5 60-8-2-7-60z"
            fill="#51615a"
            opacity=".5"
          />
          <path
            d="m203 430 31 3-5 34-30-3zM271 434l31-3 3 34-29 3z"
            fill="#263631"
          />
          <path
            d="m202 433 26 3M277 437l23-3"
            stroke="#78887b"
            strokeWidth="1.5"
          />
          <path
            d="m196 508 30 3-3 9-29-2zM276 511l31-2v9l-29 2z"
            fill="#bdc9b6"
          />
          <path
            d="M250 346v36M253 348l14-1"
            stroke="#6d7d72"
            strokeWidth="1.5"
          />
        </g>
        <g
          className={`rider-part ${active("fuesse")}`}
          role="button"
          tabIndex={0}
          aria-label="Füße auswählen"
          aria-pressed={selected === "fuesse"}
          onKeyDown={select("fuesse")}
          onClick={() => onSelect("fuesse")}
        >
          <title>Füße: Schuhe, Socken und Überschuhe</title>
          <path
            d="m193 523 31 4 1 22-22 10-38-3-2-11 25-13z"
            fill="url(#boot)"
            stroke="#1a2d24"
            strokeWidth="2"
          />
          <path
            d="m276 525 31-4 7 15 26 9 4 11-36 4-32-8z"
            fill="url(#boot)"
            stroke="#1a2d24"
            strokeWidth="2"
          />
          <path
            d="m165 549 40 4 20-8v11l-23 8-39-3zM275 545l31 10 36-4 2 9-38 6-31-13z"
            fill="#182820"
          />
          <path
            d="m187 535 22 4m-27 2 21 4m87-10 20 4m-18 2 21 4"
            stroke="#a9b3a4"
            strokeWidth="2"
          />
          <path
            d="m166 563 5-3m7 3 5-3m8 3 5-3m112 8 3-5m8 4 4-6m7 5 4-6"
            stroke="#172820"
            strokeWidth="3"
          />
        </g>
        <g
          className={`rider-part ${active("haende")}`}
          role="button"
          tabIndex={0}
          aria-label="Hände auswählen"
          aria-pressed={selected === "haende"}
          onKeyDown={select("haende")}
          onClick={() => onSelect("haende")}
        >
          <title>Hände: Handschuhe für sicheres Bremsen</title>
          <path
            d="m161 296 23 6 3 21-7 18-15-1-10-20z"
            fill="#23362d"
            stroke="#142820"
            strokeWidth="2"
          />
          <path
            d="m163 318 6 15m1-15 6 15m0-15 4 12"
            stroke="#778777"
            strokeWidth="1.5"
          />
          <path
            d="m310 303 24-7 7 23-9 21-17-1-7-15z"
            fill="#23362d"
            stroke="#142820"
            strokeWidth="2"
          />
          <path
            d="m317 321 1 13m5-15 1 13m6-14v11"
            stroke="#778777"
            strokeWidth="1.5"
          />
          <path d="m161 298 22 6-2 7-22-6m152 3 24-7 2 7-25 7" fill="#1b2d25" />
          <path d="m163 308 13 4m144 4 10-3" stroke="#d3dda7" strokeWidth="3" />
        </g>
        <g
          className={`rider-part ${active("kopf")}`}
          role="button"
          tabIndex={0}
          aria-label="Kopf auswählen"
          aria-pressed={selected === "kopf"}
          onKeyDown={select("kopf")}
          onClick={() => onSelect("kopf")}
        >
          <title>Kopf: Mützen und Halswärmer</title>
          <path d="m235 133-3 19 16 16 30-10-6-28z" fill="#b88365" />
          <path
            d="m222 84 62-1 8 22-6 27-22 17-26-6-18-24z"
            fill="#cf9a7c"
            stroke="#7d604c"
            strokeWidth="1.5"
          />
          <path
            d="m270 100 5 15-8 4"
            fill="none"
            stroke="#a2745b"
            strokeWidth="2"
          />
          <path d="M271 128h-14" stroke="#845c46" strokeWidth="2" />
          <path
            d="m228 114 6 22 28 12 18-12-11 27-23 11-27-13-13-20z"
            fill="#243b31"
          />
          <path
            d="m220 141 27 17 30-13m-61 10 30 16 30-15"
            fill="none"
            stroke="#526858"
            strokeWidth="2"
          />
          <path
            d="M211 96c-3-37 17-55 43-55 31 0 48 21 47 46l-13 17-16-5-51 4z"
            fill="url(#helmet)"
            stroke="#657866"
            strokeWidth="2"
          />
          <path
            d="M217 82c8-28 31-35 63-26M217 91l67-4 13 4"
            fill="none"
            stroke="#fafbf2"
            strokeWidth="3"
          />
          <path
            d="m231 63-4 16m18-22-2 20m17-21 3 18m11-13 8 15"
            stroke="#657867"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="m226 101 16 37 25 1 16-39"
            fill="none"
            stroke="#35473a"
            strokeWidth="3"
          />
          <rect x="248" y="136" width="9" height="6" rx="2" fill="#182c21" />
        </g>
        <g fill="none" stroke="#657e62" strokeWidth="1" opacity=".8">
          <path d="M138 98h60l13-10M295 229h65l26-17M170 319h-37l-11-14M212 429h-70l-18 8M313 544h58l14-18" />
        </g>
      </svg>
      <button
        className={`hotspot hotspot-head ${active("kopf")}`}
        onClick={() => onSelect("kopf")}
        aria-pressed={selected === "kopf"}
      >
        <span>01</span>Kopf<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-body ${active("oberkoerper")}`}
        onClick={() => onSelect("oberkoerper")}
        aria-pressed={selected === "oberkoerper"}
      >
        <span>02</span>Oberkörper<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-hands ${active("haende")}`}
        onClick={() => onSelect("haende")}
        aria-pressed={selected === "haende"}
      >
        <span>03</span>Hände<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-legs ${active("beine")}`}
        onClick={() => onSelect("beine")}
        aria-pressed={selected === "beine"}
      >
        <span>04</span>Beine<small>↗</small>
      </button>
      <button
        className={`hotspot hotspot-feet ${active("fuesse")}`}
        onClick={() => onSelect("fuesse")}
        aria-pressed={selected === "fuesse"}
      >
        <span>05</span>Füße<small>↗</small>
      </button>
      <p className="stage-instruction">
        <span className="pulse-dot" /> Tippe auf einen Körperbereich
      </p>
    </div>
  );
}
