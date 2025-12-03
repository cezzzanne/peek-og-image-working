import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Helper to replace emoji characters with Apple Emoji images via CDN
const formatTextWithAppleEmojis = (text: string, size: number = 32) => {
  // Regex to find emojis
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
    // Filter out empty strings
    if (!part) return null;
    // Wrap text in a div to ensure Satori handles it correctly within flex containers
    return <div key={index} style={{ display: 'flex' }}>{part}</div>;
  });
};

export async function GET() {
  // 1. Load Fonts
  // Ensure these files exist at these paths in your project

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
    longDescription: "Adam is driving home with Aranza, Robert, and Charlotte in an Evo car along King Edward Avenue. Christmas music plays as they look at the festive decorations.",
    colors: {
      bg: '#1a1a1a',
      cardBg: '#2563EB',
      lighterCard: 'rgba(255, 255, 255, 0.1)',
      textDim: 'rgba(255, 255, 255, 0.75)',
    }
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
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
        {/* --- Layer 1: Emoji Splash Background --- 
            Added display: flex to the container and absolute divs to satisfy Satori 
        */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3 }}>
           <div style={{ display: 'flex', position: 'absolute', top: '5%', left: '10%', transform: 'rotate(-15deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '15%', left: '80%', transform: 'rotate(20deg)' }}>{formatTextWithAppleEmojis('🚗', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '25%', left: '30%', transform: 'rotate(45deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '10%', left: '50%', transform: 'rotate(-10deg)' }}>{formatTextWithAppleEmojis('🚗', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '60%', left: '10%', transform: 'rotate(15deg)' }}>{formatTextWithAppleEmojis('🚗', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '35%', left: '60%', transform: 'rotate(-30deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '55%', left: '85%', transform: 'rotate(10deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '80%', left: '20%', transform: 'rotate(-20deg)' }}>{formatTextWithAppleEmojis('🚗', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '75%', left: '50%', transform: 'rotate(30deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
           <div style={{ display: 'flex', position: 'absolute', top: '85%', left: '90%', transform: 'rotate(-5deg)' }}>{formatTextWithAppleEmojis('🏠', 60)}</div>
        </div>

        {/* Overlay */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }} />

        {/* --- Layer 2: Main Content --- */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '500px', 
          zIndex: 10,
          gap: 20,
        }}>
          
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0, alignSelf: 'baseline', marginLeft: 14 }}>
            <img 
            src={data.user.avatar} 
            width="40" 
            height="40" 
            style={{ 
                borderRadius: '50%', // Better practice than '20' for circles
                border: '2px solid rgba(255,255,255,0.2)',
                objectFit: 'cover' 
            }} 
            />
            <div style={{ display: 'flex', color: 'white', fontWeight: 700, fontSize: 18 }}>{data.user.name}</div>
            <div style={{ display: 'flex', color: data.colors.textDim, fontSize: 14, marginTop: 4 }}>{data.timeAgo}</div>
          </div>

          {/* The Blue Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: data.colors.cardBg,
            borderRadius: 28,
            padding: 32,
            width: '100%',
            color: 'white',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            gap: 24,
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
                // This mimics your SwiftUI .shadow modifiers:
                textShadow: `
                1.5px 0 0 white, 
                -1.5px 0 0 white, 
                0 1.5px 0 white, 
                0 -1.5px 0 white
                `
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
              
              {/* Comment Button */}
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

              {/* Reactions */}
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
      width: 600,
    //   height: 600,
      fonts: interBold && interMedium ? [
        {
          name: 'SF Pro Display',
          data: interBold,
          weight: 700, // Mapping Bold to 700
          style: 'normal',
        },
        {
          name: 'SF Pro Display',
          data: interMedium,
          weight: 400, // Mapping Medium/Regular to 400
          style: 'normal',
        },
      ] : undefined,
    },
  );
}