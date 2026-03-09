import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// --- 1. Helper: Emoji Replacement ---
const formatTextWithAppleEmojis = (text: string, size: number = 32) => {
  const emojiRegex = /((?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])[\uFE00-\uFE0F]?)/g;
  
  var parts = text.split(emojiRegex);

 
  var partCount = 0

  return parts.map((part, index) => {
    if (part.match(emojiRegex)) {
        partCount++
        if (partCount > 2) {
            return null
        }
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

const formatTextWithAppleEmojisOutline = (text: string, size: number = 32, outlineWidth: number = 6) => {
  const emojiRegex = /((?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])[\uFE00-\uFE0F]?)/g;
  
  const parts = text.split(emojiRegex);
  let partCount = 0;

  // Offsets for the outline effect (8 directions)
  const offsets = [
    [-outlineWidth, -outlineWidth],
    [0, -outlineWidth],
    [outlineWidth, -outlineWidth],
    [-outlineWidth, 0],
    [outlineWidth, 0],
    [-outlineWidth, outlineWidth],
    [0, outlineWidth],
    [outlineWidth, outlineWidth],
  ];

  return parts.map((part, index) => {
    if (part.match(emojiRegex)) {
      partCount++;
      if (partCount > 2) return null;
      
      const src = `https://emojicdn.elk.sh/${encodeURIComponent(part)}?style=apple`;
      
      return (
        <span
          key={index}
          style={{
            position: 'relative',
            display: 'flex',
            width: size + outlineWidth * 2,
            height: size + outlineWidth * 2,
            marginLeft: 2,
            marginRight: 2,
          }}
        >
          {/* White outline layers */}
          {offsets.map(([x, y], i) => (
            <img
              key={`outline-${i}`}
              src={src}
              width={size}
              height={size}
              style={{
                position: 'absolute',
                left: outlineWidth + x,
                top: outlineWidth + y,
                filter: 'brightness(0) invert(1)', // Makes it white
              }}
              alt=""
            />
          ))}
          {/* Main emoji on top */}
          <img
            src={src}
            width={size}
            height={size}
            style={{
              position: 'absolute',
              left: outlineWidth,
              top: outlineWidth,
            }}
            alt={part}
          />
        </span>
      );
    }
    if (!part) return null;
    return <span key={index}>{part}</span>;
  });
};

const fetchColoredIcon = async (iconName: string, color: string, weight: string = 'regular'): Promise<string> => {
  const url = `https://unpkg.com/@phosphor-icons/core@2.1.1/assets/fill/${iconName}-fill.svg`;
  const response = await fetch(url);
  let svg = await response.text();
  
  // Replace any existing fill with the new color, or add fill to the svg tag
   // Remove the existing fill="currentColor"
  svg = svg.replace(/fill="currentColor"/g, '');
  
  // Add the new fill color
  svg = svg.replace(/<svg/, `<svg fill="${color}"`);
  
    console.log(svg);

  // Convert to data URI for use in img src
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
  const lighterCard = addHash(searchParams.get('lighterCard'), '#ffffff'); 

  // Meta Stats
  const statTime = searchParams.get('sTime') || '';
  const statWeather = searchParams.get('sWeather') || '';
  const statBattery = searchParams.get('sBattery') || '';
  const statLoc = searchParams.get('sLoc') || '';

  // Meta icons
 const statTimeIcon = searchParams.get('sTimeIcon') || '';
  const statWeatherIcon = searchParams.get('sWeatherIcon') || '';
  const statBatteryIcon = searchParams.get('sBatteryIcon') || '';
  const statLocIcon = searchParams.get('sLocIcon') || '';


  const emojis = searchParams.get('emojis') || '🚗 🏠';
  const name = searchParams.get('name') || "User";
  const uuid = searchParams.get('uuid') || "default";
  const bitmojiImageUrl = searchParams.get('bitmojiImageUrl') || '';

  // Load Fonts
  const interBold = await fetch(
    new URL('https://cdn.jsdelivr.net/npm/@fontsource/nunito@5.0.13/files/nunito-latin-800-normal.woff', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const interMedium = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  // Standard OG Dimensions
  const width = 600;
  const height = bitmojiImageUrl != '' ? 800 : 600;

    let descFontSize = 25;
  let maxDescLength = 480;

  if (rawDesc.length > 100) {
    descFontSize = 25;
    // maxDescLength = 240;
  }
  if (rawDesc.length > 200) {
    descFontSize = 24;
    // maxDescLength = 320;
  }

  if (rawDesc.length >= 260) {
    descFontSize = 22;
    // maxDescLength = 320;
  }

  if (rawDesc.length > 320) {
    descFontSize = 19;
    // maxDescLength = 320;
  }

  if (rawDesc.length > 320 && title.length > 150) {
    descFontSize = 17
  }

  let titleFontSize = 33

  if (title.length > 10) { 
    titleFontSize = 31
  }


  if (title.length > 13) {
    titleFontSize = 28
  }

  if (title.length > 15) {
    titleFontSize = 25
  }

  const truncate = (str: string, n: number) => {
  return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
};

  const longDescription = truncate(rawDesc, maxDescLength);

  const scale = 2
  const timeIcon = await fetchColoredIcon(statTimeIcon, textColor, 'bold');
  const weatherIcon = await fetchColoredIcon(statWeatherIcon, textColor, 'bold');
  const batteryIcon = await fetchColoredIcon(statBatteryIcon, textColor, 'bold');
  const locIcon = await fetchColoredIcon(statLocIcon, textColor, 'bold');

  let imageString = "https://circles2.s3.amazonaws.com/links/images/" + uuid

  let bitmojiImage = "https://circles2.s3.amazonaws.com/live-activity/produced-images/" + bitmojiImageUrl

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
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 23 * scale, fontWeight: 600, opacity: 0.75, marginTop: 0 }}>
  
  {/* Left Column (Time/Weather) - Default alignment */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
     <span>
      <img src={timeIcon} width={24 * scale} height={24 * scale} />
      <span style={{marginTop: -8, marginLeft: 6}}> {statTime}</span>
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span>
      <img src={weatherIcon} width={24 * scale} height={24 * scale} />
      <span style={{marginTop: -8, marginLeft: 6}}> {statWeather}</span>
      </span>
    </div>
  </div>

  {/* Right Column (Battery/Location) - Aligned to End */}
  <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 12, 
      alignItems: 'flex-end' // <--- 1. Moves the whole column stack to the right
    }}>
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        justifyContent: 'flex-end' // <--- 2. Ensures content inside starts from the right
      }}>
      <span>
      <img src={batteryIcon} width={24 * scale} height={24 * scale} />
      <span style={{marginTop: -8, marginLeft: 6}}> {statBattery}</span>
      </span>
    </div>
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        justifyContent: 'flex-end' // <--- 2. Ensures content inside starts from the right
      }}>
     <span>
      <img src={locIcon} width={24 * scale} height={24 * scale} />
      <span style={{marginTop: -8, marginLeft: 6}}> {statLoc}</span>
      </span>
    </div>
  </div>

</div>

          {bitmojiImageUrl != '' && 
                <img 
                    src={bitmojiImage} 
                    alt="bitmoji"
                    style={{
                        // width: 35 * scale,   // Adjust size as needed
                        height: 575,  // Keep width and height the same
                        borderRadius: 44, // Makes the image circular
                        // objectFit: 'cover'   // Prevents image distortion
                    }}
                />
          
          }
            
            {/* Title & Emoji Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginTop: 0 }}>
              <div style={{ 
                display: 'flex', 
                fontSize: titleFontSize * scale, // Larger title for 1200px image
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

              }}>
                <p>{formatTextWithAppleEmojisOutline(emojis, 57 * scale)}</p>
              </div>
            </div>
          </div>

            
          {/* Middle Section: Description */}
          {/* flexGrow: 1 ensures this fills the empty space in the middle */}
          <div style={{ 
            display: 'flex', 
            fontSize: descFontSize * scale, // Uses the calculated size
            lineHeight: 1.4, 
            opacity: 0.90,
            // flexGrow: 1, // Takes up remaining space
            overflow: 'hidden', // Hides anything that still overflows
            alignItems: 'center'
          }}>
            {longDescription}
        </div>

        {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 10 * scale, alignItems: 'center' }}>
                <img 
                    src={imageString} 
                    alt="Profile"
                    style={{
                        width: 30 * scale,   // Adjust size as needed
                        height: 30 * scale,  // Keep width and height the same
                        borderRadius: '50%', // Makes the image circular
                        objectFit: 'cover'   // Prevents image distortion
                    }}
                />
                <div style={{ display: 'flex', fontSize: 15 * scale }}>{name}</div>
            </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10 * scale,
            backgroundColor: lighterCard,
            // padding: '12px 20px',
            paddingTop: 12 * scale,
            paddingBottom: 12 * scale,
            paddingLeft: 20 * scale,
            paddingRight: 20 * scale,
            borderRadius: 28 * scale,
            fontSize: 26 * scale,
            fontWeight: 700,
          }}>
            <div style={{ display: 'flex', fontSize: 15 * scale }}>peekapp.live</div>
          </div>

        </div> */}

          
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