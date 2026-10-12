import { tr } from "../i18n/core";
import type { Group } from "../types";
import { useId } from "react";
// Original, deliberately schematic product illustrations; never presented as product photos.
export function GearArt({
  group,
  color = "var(--accent)",
}: {
  group: Group;
  color?: string;
}) {
  const gradientId = "gear-" + useId().replaceAll(":", "");
  return (
    <svg
      className="gear-art"
      viewBox="0 0 280 160"
      role="img"
      aria-label={tr("Symbolabbildung, kein Original-Produktfoto")}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop stopColor={color} />
          <stop offset="1" stopColor="var(--rider-dark)" />
        </linearGradient>
      </defs>
      <ellipse cx="140" cy="143" rx="72" ry="5" fill="#172925" opacity=".07" />
      {group === "pogie" && (
        <g>
          <path
            d="M47 70h186"
            stroke="#514151"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="m40 51 65-15q23-3 29 16l7 39q2 13-15 19l-58 14q-22 4-28-15l-11-32q-4-16 11-26z"
            fill={`url(#${gradientId})`}
          />
          <path
            d="m240 51-65-15q-23-3-29 16l-7 39q-2 13 15 19l58 14q22 4 28-15l11-32q4-16-11-26z"
            fill={`url(#${gradientId})`}
          />
          <ellipse
            cx="99"
            cy="103"
            rx="28"
            ry="12"
            transform="rotate(-17 99 103)"
            fill="#3c283e"
          />
          <ellipse
            cx="181"
            cy="103"
            rx="28"
            ry="12"
            transform="rotate(17 181 103)"
            fill="#3c283e"
          />
          <path
            d="m40 60 49-10m151 10-49-10"
            stroke="#fff4fa"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="m62 42 8 6m148-6-8 6" stroke="#fff" strokeWidth="3" />
        </g>
      )}
      {(group === "shell" || group === "softshell" || group === "base") && (
        <g stroke="#24392e" strokeWidth="1.5">
          <path
            d="m112 20 15-6 26 0 16 6 26 20 20 54-22 10-21-37 1 68h-67l1-69-21 37-21-9 20-54z"
            fill={`url(#${gradientId})`}
          />
          <path
            d="m125 16 14 17 15-17m-14 18v102"
            fill="none"
            stroke="#a7b997"
            strokeWidth="2"
          />
          <path d="m111 84 20 3m19 0 20-3" stroke="#132a20" strokeWidth="3" />
          {group !== "base" && (
            <path d="m108 112 64 1" stroke="#c9d7ac" strokeWidth="7" />
          )}
          <path d="m93 41 14 21m77-21-12 21" fill="none" stroke="#82967c" />
        </g>
      )}
      {group === "head" && (
        <g>
          <path
            d="M83 92c0-42 18-71 57-71s57 29 57 71l-9 35c-32 11-63 11-96 0z"
            fill={color}
            stroke="#294132"
            strokeWidth="2"
          />
          <path
            d="m83 92 5 28c36 12 70 12 105-1l4-27c-38 11-76 10-114 0z"
            fill="#789271"
          />
          <path
            d="M108 34c-10 20-14 38-11 62m23-68-4 69m47-68 6 68m12-59 5 57"
            fill="none"
            stroke="#a9b99b"
            opacity=".4"
            strokeWidth="2"
          />
        </g>
      )}
      {(group === "glove" || group === "liner") && (
        <g fill={color} stroke="#243d2d" strokeWidth="2">
          <path d="m93 119-18-27-4-27q0-8 7-7l9 18-4-37q0-8 7-8l5 36-1-42q1-8 8-6l4 43 4-36q2-7 8-4l-1 39 9-25q4-6 8-2l-9 44 3 27-5 15z" />
          <path d="m174 119 18-27 4-27q0-8-7-7l-9 18 4-37q0-8-7-8l-5 36 1-42q-1-8-8-6l-4 43-4-36q-2-7-8-4l1 39-9-25q-4-6-8-2l9 44-3 27 5 15z" />
          <path
            d="m89 113 33 6-3 14-35-6zM146 119l32-6 5 14-35 6z"
            fill="#aebf93"
          />
          <path
            d="m89 88 24 3m38 0 23-3"
            fill="none"
            stroke="#91a482"
            strokeWidth="3"
          />
        </g>
      )}
      {group === "pants" && (
        <g>
          <path
            d="m104 18 72 0 9 114-30 1-17-71-10 70-30-1z"
            fill={color}
            stroke="#23372c"
            strokeWidth="2"
          />
          <path
            d="m107 22 66 0m-34 3v26m-34 73 26 3m18 0 31-3"
            stroke="#90a385"
            fill="none"
            strokeWidth="2"
          />
          <path d="m100 118 27 2m28 1 28-1" stroke="#b9cba1" strokeWidth="6" />
        </g>
      )}
      {(group === "shoe" || group === "cover") && (
        <g>
          <path
            d="m109 36 47 6 6 53 38 19q19 8 10 20l-56 5-76-8-2-20 22-18z"
            fill={color}
            stroke="#223b2c"
            strokeWidth="2"
          />
          <path d="m78 123 80 9 52-6v10l-53 8-81-9z" fill="#21362a" />
          <path
            d="m111 60 41 5m-43 7 45 5m-46 7 48 5m-43 7 47 5"
            stroke="#aec39c"
            strokeWidth="3"
          />
          <path d="m95 103 37 9" stroke="#697e62" strokeWidth="2" />
          {group === "cover" && (
            <path d="m154 47 9 63" stroke="#cad8b0" strokeWidth="4" />
          )}
        </g>
      )}
      {group === "sock" && (
        <g fill={color} stroke="#29412f" strokeWidth="2">
          <path d="m99 26 39 0-2 78-14 19-35 5q-18-9-4-20l18-11z" />
          <path d="m155 30 37 1-1 75-12 18-37 6q-17-9-3-20l18-11z" />
          <path d="m98 36 39 1m18 3 36 1" stroke="#b5c99e" strokeWidth="7" />
          <path
            d="m105 54 24 1m-24 11 24 1m33-9h21m-22 10h21"
            stroke="#a7bf95"
            opacity=".5"
          />
        </g>
      )}
    </svg>
  );
}
