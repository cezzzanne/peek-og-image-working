import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// --- 1. Helper: Emoji Replacement ---
const formatTextWithAppleEmojis = (text: string, size: number = 32) => {
  const emojiRegex = /((?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])[\uFE00-\uFE0F]?)/g;
  
  const parts = text.split(emojiRegex);

  return parts.map((part, index) => {
    if (part.match(emojiRegex)) {
      return (
        <img
          key={index}
          src={`https://emojicdn.elk.sh/${encodeURIComponent(part)}?style=apple`}
          width={size}
          height={size}
          style={{ marginLeft: 2, marginRight: 2 }}
          alt={part}
        />
      );
    }
    if (!part) return null;
    return <span key={index}>{part}</span>;
  });
};

const addHash = (color: string | null, fallback: string) => {
  if (!color) return fallback;
  return color.startsWith('#') ? color : `#${color}`;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Extract Query Params
  const title = searchParams.get('title') || 'Default Title';
  const rawDesc =  searchParams.get('desc') || '';
  
  // Colors
  // 'bg' is now used as the Text Color (to keep contrast logic from previous version)
  // 'cardBg' is the Background Color of the whole image
  const textColor = addHash(searchParams.get('bg'), '#1a1a1a'); 
  const backgroundColor = addHash(searchParams.get('cardBg'), '#ffffff'); 

  // Meta Stats
  const statTime = searchParams.get('sTime') || '';
  const statWeather = searchParams.get('sWeather') || '';
  const statBattery = searchParams.get('sBattery') || '';
  const statLoc = searchParams.get('sLoc') || '';
  const emojis = searchParams.get('emojis') || '🚗 🏠';

  // Load Fonts
  const interBold = await fetch(
    new URL('https://cdn.jsdelivr.net/npm/@fontsource/nunito@5.0.13/files/nunito-latin-800-normal.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interMedium = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  // Standard OG Dimensions
  const width = 600;
  const height = 650;

    let descFontSize = 35;
  let maxDescLength = 180;

  if (rawDesc.length > 100) {
    descFontSize = 31;
    maxDescLength = 240;
  }
  if (rawDesc.length > 200) {
    descFontSize = 27;
    maxDescLength = 320;
  }

  const truncate = (str: string, n: number) => {
  return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
};

  const longDescription = truncate(rawDesc, maxDescLength);

  const scale = 2

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around', // Pushes header up, footer down
          backgroundColor: backgroundColor,
          color: textColor,
          fontFamily: '"SF Pro Display", sans-serif',
          // Internal padding so text doesn't hit the edge
          paddingTop: 30 * scale,
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
          paddingBottom: 30 * scale,
          overflow: 'hidden',
        }}
      >
          {/* Top Section: Meta & Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Meta Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 23 * scale, fontWeight: 600, opacity: 0.6, marginTop: -10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{formatTextWithAppleEmojis(statTime, 17 * scale)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{formatTextWithAppleEmojis(statWeather, 17 * scale)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{formatTextWithAppleEmojis(statBattery, 17 * scale)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{formatTextWithAppleEmojis(statLoc, 17 * scale)}</div>
              </div>
            </div>

            {/* Title & Emoji Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0, marginTop: 40 }}>
              <div style={{ 
                display: 'flex', 
                fontSize: 34 * scale, // Larger title for 1200px image
                fontWeight: 800, 
                lineHeight: 1.1, 
                // maxWidth: '100%',
                // maxHeight: '110px', // Limit title height
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {title}
              </div>
              <div style={{ 
                display: 'flex', 
                fontSize: 30 * scale, 
                transform: 'rotate(-12deg)', 
                marginTop: 10,
                // Optional: Add a subtle shadow to emojis to make them pop
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
              }}>
                {formatTextWithAppleEmojis(emojis, 72 * scale)}
              </div>
            </div>
          </div>

          {/* Middle Section: Description */}
          {/* flexGrow: 1 ensures this fills the empty space in the middle */}
          <div style={{ 
            display: 'flex', 
            fontSize: 24 * scale, // Uses the calculated size
            lineHeight: 1.4, 
            opacity: 0.95,
            flexGrow: 1, // Takes up remaining space
            overflow: 'hidden', // Hides anything that still overflows
            alignItems: 'center'
          }}>
            {longDescription}
        </div>

          
      </div>
    ),
    {
      width: width * scale,
      height: height * scale,
      fonts: interBold && interMedium ? [
        { name: 'SF Pro Display', data: interBold, weight: 700, style: 'normal' },
        { name: 'SF Pro Display', data: interMedium, weight: 400, style: 'normal' },
      ] : undefined,
    },
  );
}