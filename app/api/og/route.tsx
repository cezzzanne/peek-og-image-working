import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// --- 1. Helper: Emoji Replacement ---
const formatTextWithAppleEmojis = (text: string, size: number = 32) => {
  const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  const parts = text.split(emojiRegex);
  
  return parts.map((part, index) => {
    if (part.match(emojiRegex)) {
      return (
        <img
          key={index}
          src={`https://emojicdn.elk.sh/${part}?style=apple`}
          width={size}
          height={size}
          style={{ marginLeft: 2, marginRight: 2 }}
          alt={part}
        />
      );
    }
    if (!part) return null;
    return <div key={index} style={{ display: 'flex' }}>{part}</div>;
  });
};

// --- 2. Helper: Height Estimation ---
// This estimates how many pixels tall a block of text will be
function estimateTextHeight(
  text: string, 
  fontSize: number, 
  lineHeight: number, 
  maxWidth: number, 
  fontWeight: 'normal' | 'bold' = 'normal'
) {
  if (!text) return 0;

  // 1. Approximate average character width
  // 'Inter' and 'SF Pro' are roughly 0.5x width of height. Bold is wider.
  const avgCharWidth = fontWeight === 'bold' ? fontSize * 0.6 : fontSize * 0.5;
  
  // 2. Calculate how many characters fit on one line
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  const words = text.split(' ');
  let lineCount = 1;
  let currentLineChars = 0;

  for (const word of words) {
    // If adding this word exceeds the line length...
    if (currentLineChars + word.length > maxCharsPerLine) {
      lineCount++; // Start a new line
      currentLineChars = word.length; // Reset count to this word
    } else {
      // Add word length + 1 for the space
      currentLineChars += word.length + 1;
    }
  }

  // 3. Return total height
  return Math.ceil(lineCount * fontSize * lineHeight);
}

const addHash = (color: string | null, fallback: string) => {
  if (!color) return fallback;
  return color.startsWith('#') ? color : `#${color}`;
};

// ... imports and helper functions (formatTextWithAppleEmojis, estimateTextHeight) remain the same ...

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Extract Query Params with defaults
  const title = searchParams.get('title') || 'Default Title';
  const longDescription = searchParams.get('desc') || '';
  const timeAgo = searchParams.get('time') || 'now';
  const userName = searchParams.get('user') || 'User';
  const userAvatar = searchParams.get('avatar') || ''; // Handle empty avatar logic in JSX
  
  // Extract Colors
  const bg = addHash(searchParams.get('bg'), '#1a1a1a');
  const cardBg = addHash(searchParams.get('cardBg'), '#2563EB');
  const lighterCard = addHash(searchParams.get('lighterCard'), 'rgba(255, 255, 255, 0.1)');

  // Extract Meta Stats
  const statTime = searchParams.get('sTime') || '';
  const statWeather = searchParams.get('sWeather') || '';
  const statBattery = searchParams.get('sBattery') || '';
  const statLoc = searchParams.get('sLoc') || '';
  
  // Extract Emojis
  const emojis = searchParams.get('emojis') || '🚗 🏠';

  // Load Fonts (Keep your existing font loading code here)
  const interBold = await fetch(
    new URL('https://cdn.jsdelivr.net/npm/@fontsource/nunito@5.0.13/files/nunito-latin-800-normal.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interMedium = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  // --- 3. Calculate Dynamic Height ---
  const CARD_WIDTH = 500;
  const PADDING = 64;
  const USABLE_WIDTH = CARD_WIDTH - PADDING;
  const STATIC_HEIGHT = 200; 

  const titleHeight = estimateTextHeight(title, 24, 1.3, USABLE_WIDTH - 32, 'bold');
  const descHeight = estimateTextHeight(longDescription, 18, 1.5, USABLE_WIDTH - 32, 'normal');
  const dynamicHeight = Math.round(STATIC_HEIGHT + titleHeight + descHeight) - 1;

  return new ImageResponse(
    (
      <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg, // Dynamic
          fontFamily: '"SF Pro Display", sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${CARD_WIDTH}px`, gap: 20 }}>
          
          {/* The Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: cardBg, // Dynamic
            borderRadius: '28px 28px 0 0',
            padding: 32,
            width: '100%',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            gap: 24,
            flexGrow: 1, 
          }}>
            
            {/* Meta Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 16, fontWeight: 600, color: bg }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: bg }}>{formatTextWithAppleEmojis(statTime, 20)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: bg }}>{formatTextWithAppleEmojis(statWeather, 20)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: bg }}>{formatTextWithAppleEmojis(statBattery, 20)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: bg }}>{formatTextWithAppleEmojis(statLoc, 20)}</div>
              </div>
            </div>

            {/* Title Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, lineHeight: 1.3, maxWidth: '75%', color: bg }}>
                {title}
              </div>
               <div style={{ display: 'flex', fontSize: 40, transform: 'rotate(-10deg)', color: bg, gap: 4, textShadow: `1.5px 0 0 white, -1.5px 0 0 white, 0 1.5px 0 white, 0 -1.5px 0 white` }}>
                {formatTextWithAppleEmojis(emojis, 40)}
            </div>
            </div>

            {/* Body Text */}
            <div style={{ display: 'flex', fontSize: 18, lineHeight: 1.5, opacity: 0.95, color: bg }}>
              {longDescription}
            </div>

            {/* Footer (Simplified for brevity, use your existing footer code but use `lighterCard` var) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
               {/* ... Footer content using `lighterCard` variable ... */}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 500,
      height: dynamicHeight,
      fonts: interBold && interMedium ? [
        { name: 'SF Pro Display', data: interBold, weight: 700, style: 'normal' },
        { name: 'SF Pro Display', data: interMedium, weight: 400, style: 'normal' },
      ] : undefined,
    },
  );
}