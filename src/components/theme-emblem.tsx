import type { DesignThemeId } from '@/config/design-themes';

/**
 * The art inside the signature doorway, one per Borderlands theme.
 * Render with `theme` to force one; without it all are rendered and the
 * page theme's CSS shows the matching one (arcane keeps the bare door).
 */
type Props = {
  theme?: Exclude<DesignThemeId, 'arcane'>;
  /** Unique per page instance; SVG gradient ids must not collide. */
  idPrefix: string;
};

export function ThemeEmblem({ theme, idPrefix }: Props) {
  return (
    <>
      {!theme || theme === 'keep' ? <KeepGate id={idPrefix} /> : null}
      {!theme || theme === 'wilderness' ? (
        <WildernessSpring id={idPrefix} />
      ) : null}
      {!theme || theme === 'caves' ? <CaveMouth id={idPrefix} /> : null}
    </>
  );
}

function KeepGate({ id }: { id: string }) {
  const torch = `${id}-keep-torch`;
  const brick = `${id}-keep-brick`;
  const arch = `${id}-keep-arch`;
  const wall =
    'M8 220V42h13V28h17v14h15V28h17v14h30V28h17v14h15V28h17v14h13v178Z';
  const opening = 'M52 220V128a33 33 0 0 1 66 0V220Z';

  return (
    <svg
      className="emblem emblem--keep"
      viewBox="0 0 170 220"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={torch} cx="50%" cy="90%" r="70%">
          <stop offset="0" stopColor="#f0b24f" stopOpacity="0.75" />
          <stop offset="0.6" stopColor="#a3262f" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={brick}
          width="22"
          height="11"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 10.5H22M11 0V10.5"
            stroke="#3b322b"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
        <clipPath id={arch}>
          <path d={opening} />
        </clipPath>
      </defs>
      <path d={wall} fill="#221c18" stroke="#6b5c4c" strokeWidth="1.2" />
      <path d={wall} fill={`url(#${brick})`} opacity="0.7" />
      <path d={opening} fill="#0b0908" />
      <path className="emblem__glow" d={opening} fill={`url(#${torch})`} />
      <g
        clipPath={`url(#${arch})`}
        stroke="#8a7560"
        strokeWidth="1.6"
        opacity="0.85"
      >
        <path d="M60 90V160M70 90V164M80 90V166M90 90V166M100 90V164M110 90V160" />
        <path d="M52 112H118M52 130H118M52 148H118" />
      </g>
      <path
        d="M52 220V128a33 33 0 0 1 66 0V220"
        fill="none"
        stroke="#c9a15a"
        strokeWidth="1.4"
      />
      <path
        d="M47 220V128a38 38 0 0 1 76 0V220"
        fill="none"
        stroke="#6b5c4c"
        strokeWidth="1"
      />
      <path
        d="M77 48h16v38l-8-7-8 7Z"
        fill="#a3262f"
        stroke="#c9a15a"
        strokeWidth="0.8"
      />
      <rect
        x="81.5"
        y="58"
        width="7"
        height="7"
        transform="rotate(45 85 61.5)"
        fill="#e0a943"
      />
      <g className="emblem__flicker">
        <circle cx="34" cy="150" r="12" fill="#f0b24f" opacity="0.18" />
        <circle cx="136" cy="150" r="12" fill="#f0b24f" opacity="0.18" />
      </g>
      <circle cx="34" cy="150" r="3" fill="#f0b24f" />
      <circle cx="136" cy="150" r="3" fill="#f0b24f" />
    </svg>
  );
}

function WildernessSpring({ id }: { id: string }) {
  const halo = `${id}-wild-halo`;
  const water = `${id}-wild-water`;
  const clip = `${id}-wild-clip`;
  const frame =
    'M10 215C6 140 18 70 52 34 70 16 100 16 118 34 152 70 164 140 160 215Z';

  return (
    <svg
      className="emblem emblem--wilderness"
      viewBox="0 0 170 220"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={halo} cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stopColor="#dfe8ea" stopOpacity="0.35" />
          <stop offset="1" stopColor="#dfe8ea" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f8f9a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0f1a15" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={frame} />
        </clipPath>
      </defs>
      <path d={frame} fill="#0a1411" stroke="#2b4337" strokeWidth="1.2" />
      <g clipPath={`url(#${clip})`}>
        <circle cx="85" cy="78" r="44" fill={`url(#${halo})`} />
        <circle cx="85" cy="78" r="20" fill="#e6eef0" />
        <path
          d="M0 150 22 92 44 150Z M28 160 46 110 64 160Z M106 160 124 104 142 160Z M126 150 150 84 174 150Z"
          fill="#0d1c16"
        />
        <path
          d="M0 160 14 120 28 160Z M140 165 156 126 172 165Z"
          fill="#132a20"
        />
        <rect x="0" y="156" width="170" height="70" fill="#0b1612" />
        <ellipse cx="85" cy="182" rx="56" ry="14" fill={`url(#${water})`} />
        <ellipse cx="85" cy="180" rx="9" ry="3" fill="#dfe8ea" opacity="0.55" />
        <g className="emblem__ripples" fill="none" stroke="#9ac7cf">
          <ellipse cx="85" cy="182" rx="30" ry="6" strokeOpacity="0.35" />
          <ellipse cx="85" cy="183" rx="44" ry="10" strokeOpacity="0.18" />
        </g>
        <g className="emblem__flicker" fill="#e8cf6a">
          <circle cx="40" cy="130" r="1.6" />
          <circle cx="128" cy="118" r="1.4" />
          <circle cx="58" cy="100" r="1.2" />
          <circle cx="116" cy="146" r="1.6" />
          <circle cx="98" cy="128" r="1.1" />
          <circle cx="40" cy="130" r="6" opacity="0.25" />
          <circle cx="128" cy="118" r="5" opacity="0.25" />
          <circle cx="116" cy="146" r="6" opacity="0.25" />
        </g>
      </g>
      <path
        d="M10 215C6 140 18 70 52 34 70 16 100 16 118 34 152 70 164 140 160 215"
        fill="none"
        stroke="#7cb784"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  );
}

function CaveMouth({ id }: { id: string }) {
  const ember = `${id}-caves-ember`;
  const chaos = `${id}-caves-chaos`;
  const mouth =
    'M30 220C28 170 36 132 48 110 56 92 66 84 74 80 82 70 96 72 104 82 116 92 128 112 134 140 140 168 140 196 142 220Z';

  return (
    <svg
      className="emblem emblem--caves"
      viewBox="0 0 170 220"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={ember} cx="50%" cy="75%" r="60%">
          <stop offset="0" stopColor="#d8692a" stopOpacity="0.6" />
          <stop offset="0.7" stopColor="#d8692a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={chaos} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#b26ad0" stopOpacity="0.65" />
          <stop offset="1" stopColor="#b26ad0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M0 220V30l18-12 20 10 16-16 22 8 18-14 20 12 22-6 16 14 18-4V220Z"
        fill="#221d1a"
      />
      <path
        d="M0 70l30 8 24-6M120 60l28 10 22-4M0 130l22 4M150 140l20-6"
        stroke="#3a322c"
        strokeWidth="1.2"
        fill="none"
      />
      <path d={mouth} fill="#070606" stroke="#5a4d43" strokeWidth="1.4" />
      <path className="emblem__glow" d={mouth} fill={`url(#${ember})`} />
      <circle
        className="emblem__flicker"
        cx="86"
        cy="140"
        r="34"
        fill={`url(#${chaos})`}
      />
      <g transform="translate(86 140)">
        <path
          d="M-14 10C-14-6-9-16 0-16S14-6 14 10L18 14H-18Z"
          fill="#2a1f2e"
          stroke="#c99be0"
          strokeWidth="1.3"
        />
        <path d="M0-16v-6" stroke="#c99be0" strokeWidth="1.3" />
        <circle cx="0" cy="18" r="3" fill="#c99be0" />
        <path
          d="M3-12 -2-2 4 4 -1 13"
          fill="none"
          stroke="#efe6d6"
          strokeWidth="1.1"
        />
      </g>
      <g
        stroke="#ece4d6"
        strokeOpacity="0.35"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M14 168l12-22M20 172l12-22M26 176l12-22" />
      </g>
      <g fill="#ece4d6" opacity="0.55">
        <path d="M54 214l6-8 3 3 5-4 2 6-6 3Z" />
        <circle cx="120" cy="210" r="2.4" />
        <path d="M112 206l10 6" stroke="#ece4d6" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
