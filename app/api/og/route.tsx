import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const emojiSrc = (e: string) =>
  `https://emojicdn.elk.sh/${encodeURIComponent(e)}?style=apple`;

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;

function OutlinedEmoji({
  emoji, size, outline, marginLeft = 0,
}: { emoji: string; size: number; outline: number; marginLeft?: number }) {
  const src = emojiSrc(emoji);
  const box = size + outline * 2;
  const d = outline * 0.71; // diagonals shorter so the outline looks round
  const offsets = [
    [-outline, 0], [outline, 0], [0, -outline], [0, outline],
    [-d, -d], [d, -d], [-d, d], [d, d],
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', width: box, height: box, marginLeft }}>
      {offsets.map(([x, y], i) => (
        <img
          key={i}
          src={src}
          width={size}
          height={size}
          style={{
            position: 'absolute',
            left: outline + x,
            top: outline + y,
            filter: 'brightness(0) invert(1)',
          }}
        />
      ))}
      <img
        src={src}
        width={size}
        height={size}
        style={{ position: 'absolute', left: outline, top: outline }}
      />
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const e1 = searchParams.get('e1') || '🔥';
  const e2 = searchParams.get('e2') || '⚡';
  const scale = clamp(parseInt(searchParams.get('scale') ?? '1', 10), 1, 3);

  // Points, multiplied by scale. Defaults are sized so the rotated pair
  // still fits inside 90pt; tune `size`/`rotate` from the query string.
  const canvas = 90 * scale;
  const size = clamp(parseInt(searchParams.get('size') ?? '38', 10), 20, 60) * scale;
  const outline = 3 * scale;
  const overlap = 8 * scale;
  const rotate = clamp(parseInt(searchParams.get('rotate') ?? '-12', 10), -45, 45);

  return new ImageResponse(
    (
      <div
        style={{
          width: canvas,
          height: canvas,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            transform: `rotate(${rotate}deg)`,
          }}
        >
          <OutlinedEmoji emoji={e1} size={size} outline={outline} />
          <OutlinedEmoji emoji={e2} size={size} outline={outline} marginLeft={-overlap} />
        </div>
      </div>
    ),
    {
      width: canvas,
      height: canvas,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}