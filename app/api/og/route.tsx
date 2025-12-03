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
const estimateTextHeight = (
  text: string, 
  fontSize: number, 
  lineHeight: number, 
  containerWidth: number,
  fontWeight: 'normal' | 'bold' = 'normal'
) => {
  if (!text) return 0;

  // Average pixels per character (heuristic)
  // Bold fonts are wider (~0.6x size), Normal are narrower (~0.5x size)
  const charWidth = fontSize * (fontWeight === 'bold' ? 0.6 : 0.5);
  
  const charsPerLine = Math.floor(containerWidth / charWidth);
  const lines = Math.ceil(text.length / charsPerLine);
  
  // Return lines * line-height-pixels
  return lines * (fontSize * lineHeight);
};

export async function GET() {
  // Load Fonts
  const interBold = await fetch(
    new URL('https://cdn.jsdelivr.net/npm/@fontsource/nunito@5.0.13/files/nunito-latin-800-normal.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interMedium = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const data = {
    user: {
      name: "Adam",
      avatar: "https://circles2.s3.amazonaws.com/links/images/92ce9448-64e9-4ea9-a423-295d5488be0b",
    },
    timeAgo: "16m",
    title: "Attending campus event at University Commons with friends getting hot chocolate and tote bags",
    longDescription: "Gil is rela",
    colors: {
      bg: '#1a1a1a',
      cardBg: '#2563EB',
      lighterCard: 'rgba(255, 255, 255, 0.1)',
      textDim: 'rgba(255, 255, 255, 0.75)',
    }
  };

  // --- 3. Calculate Dynamic Height ---
  const CARD_WIDTH = 500;
  const PADDING = 64; // 32px left + 32px right
  const USABLE_WIDTH = CARD_WIDTH - PADDING;

  // A. Static Vertical Elements (Padding, Gaps, Meta Row, Footer)
  // Top Padding (32) + Meta Row (~24) + Gap (24) + Gap (24) + Footer (~50) + Bottom Padding (32)
  const STATIC_HEIGHT = 200; 

  // B. Title Height
  // Title is 24px font, 1.3 line height. Max width is 75% of usable width.
  const titleHeight = estimateTextHeight(
    data.title, 
    24, // font size
    1.3, // line height
    USABLE_WIDTH * 0.75, // width constraint
    'bold'
  );

  // C. Description Height
  // Desc is 18px font, 1.5 line height. Full usable width.
  const descHeight = estimateTextHeight(
    data.longDescription, 
    18, 
    1.5, 
    USABLE_WIDTH, 
    'normal'
  );

  // Total Height + a small buffer (20px) to be safe
  const dynamicHeight = Math.round(STATIC_HEIGHT + titleHeight + descHeight + 20);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%', // Ensure wrapper fills the calculated canvas
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: data.colors.bg,
          fontFamily: '"SF Pro Display", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Main Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${CARD_WIDTH}px`, // Fixed width
          zIndex: 10,
          gap: 20,
        }}>
          
          {/* The Blue Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: data.colors.cardBg,
            borderRadius: '28px 28px 0 0',
            padding: 32,
            width: '100%',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            gap: 24,
            // Ensure the card takes up the available height if needed
            flexGrow: 1, 
          }}>
            
            {/* Meta Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formatTextWithAppleEmojis('🕒 3:29PM', 20)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formatTextWithAppleEmojis('⛅ 8°C', 20)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formatTextWithAppleEmojis('🔋 100%', 20)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {formatTextWithAppleEmojis('🌎 Central Vancouver', 20)}
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, lineHeight: 1.3, maxWidth: '75%' }}>
                {data.title}
              </div>
               <div style={{ 
                display: 'flex', 
                fontSize: 40, 
                transform: 'rotate(-10deg)', 
                gap: 4,
                textShadow: `1.5px 0 0 white, -1.5px 0 0 white, 0 1.5px 0 white, 0 -1.5px 0 white`
            }}>
                {formatTextWithAppleEmojis('🚗 🏠', 40)}
            </div>
            </div>

            {/* Body Text */}
            <div style={{ display: 'flex', fontSize: 18, lineHeight: 1.5, opacity: 0.95 }}>
              {data.longDescription}
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: data.colors.lighterCard,
                padding: '12px 20px',
                borderRadius: 20,
                fontSize: 16,
                fontWeight: 700,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <div style={{ display: 'flex' }}>Comment</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: data.colors.lighterCard, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {formatTextWithAppleEmojis('🚗', 24)}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: data.colors.lighterCard, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {formatTextWithAppleEmojis('🏢', 24)}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: data.colors.lighterCard, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {formatTextWithAppleEmojis('👍', 24)}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 500,
      height: dynamicHeight, // <--- Use the calculated height here
      fonts: interBold && interMedium ? [
        {
          name: 'SF Pro Display',
          data: interBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'SF Pro Display',
          data: interMedium,
          weight: 400,
          style: 'normal',
        },
      ] : undefined,
    },
  );
}