import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// --- Helper: Emoji Replacement ---
const formatTextWithAppleEmojis = (text: string, size: number = 32) => {
  const emojiRegex =
    /((?:[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])[\uFE00-\uFE0F]?)/g;

  const parts = text.split(emojiRegex);
  let partCount = 0;

  return parts.map((part, index) => {
    if (part.match(emojiRegex)) {
      partCount++;
      if (partCount > 3) return null;
      return (
        <img
          key={index}
          src={`https://emojicdn.elk.sh/${encodeURIComponent(part)}?style=apple`}
          width={size}
          height={size}
          style={{ marginLeft: 1, marginRight: 1 }}
          alt={part}
        />
      );
    }
    if (!part) return null;
    return <span key={index}>{part}</span>;
  });
};

interface CardData {
  title: string;
  emojis: string;
  time: string;
  cardBg: string;
  textColor: string;
  profileImage: string;
  notificationCount?: number;
  isOffline: boolean;
  name: string;
}

const addHash = (color: string | null, fallback: string) => {
  if (!color) return fallback;
  return color.startsWith('#') ? color : `#${color}`;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // ---- Parse cards (max 6) ----
  const cards: CardData[] = [];

  for (let i = 0; i < 6; i++) {
    const title = searchParams.get(`c${i}_title`);
    if (!title) continue;

    cards.push({
      title,
      emojis: searchParams.get(`c${i}_emojis`) || '',
      time: searchParams.get(`c${i}_time`) || '',
      cardBg: addHash(searchParams.get(`c${i}_cardBg`), '#ffffff'),
      textColor: addHash(searchParams.get(`c${i}_textColor`), '#1a1a1a'),
      profileImage: searchParams.get(`c${i}_profileImage`) || '',
      notificationCount: searchParams.get(`c${i}_notif`)
        ? parseInt(searchParams.get(`c${i}_notif`)!, 10)
        : undefined,
      isOffline: searchParams.get(`c${i}_offline`) === 'true',
      name: searchParams.get(`c${i}_name`) || '',
    });
  }

  if (cards.length === 0) {
    cards.push({
      title: 'No cards provided',
      emojis: '🤷',
      time: '',
      cardBg: '#ffffff',
      textColor: '#1a1a1a',
      profileImage: '',
      isOffline: false,
      name: '',
    });
  }

  // Load Fonts
  const fontBold = await fetch(
    new URL(
      'https://cdn.jsdelivr.net/npm/@fontsource/nunito@5.0.13/files/nunito-latin-800-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

  const fontMedium = await fetch(
    new URL(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

  // --- Layout constants ---
  const scale = 2;
  const outerPadding = 24 * scale;
  const cardGap = 16 * scale;
  const cardBorderRadius = 28 * scale;
  const colCount = 2;

  // Fixed card dimensions
  const cardHeight = 190 * scale; // fixed slot height
  const imgWidth = 430 * scale;
  const cardWidth = (imgWidth - outerPadding * 2 - cardGap) / colCount;

  // Dynamic image height: grows with each row
  const rowCount = Math.ceil(cards.length / colCount);
  const imgHeight =
    outerPadding * 2 + rowCount * cardHeight + (rowCount - 1) * cardGap;

  // --- Font sizing ---
  const getTitleFontSize = (text: string) => {
    if (text.length > 80) return 13 * scale;
    if (text.length > 60) return 14 * scale;
    if (text.length > 40) return 15 * scale;
    return 18 * scale;
  };

  // --- Render a single card ---
  const renderCard = (card: CardData, index: number) => {
    const col = index % colCount;
    const row = Math.floor(index / colCount);
    const x = outerPadding + col * (cardWidth + cardGap);
    const y = outerPadding + row * (cardHeight + cardGap);
    const innerPad = 18 * scale;

    // --- Offline card variant ---
    if (card.isOffline) {
      const offlineProfileSize = 60 * scale;
      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cardWidth,
            height: cardHeight,
            backgroundColor: '#2a2a2a',
            borderRadius: cardBorderRadius,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12 * scale,
            overflow: 'hidden',
          }}
        >
          {card.profileImage ? (
            <img
              src={card.profileImage}
              width={offlineProfileSize}
              height={offlineProfileSize}
              style={{ borderRadius: '50%', objectFit: 'cover', opacity: 0.7 }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: offlineProfileSize,
                height: offlineProfileSize,
                borderRadius: '50%',
                backgroundColor: '#444444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28 * scale,
                color: '#888888',
              }}
            >
              👤
            </div>
          )}
          {card.name ? (
            <div
              style={{
                display: 'flex',
                fontSize: 16 * scale,
                fontWeight: 700,
                color: '#ffffff',
                opacity: 0.85,
              }}
            >
              {card.name}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: 13 * scale,
              fontWeight: 600,
              color: '#ffffff',
              opacity: 0.4,
            }}
          >
            offline
          </div>
        </div>
      );
    }

    // --- Normal card ---
    const titleFontSize = getTitleFontSize(card.title);
    const emojiSize = 30 * scale;
    const profileSize = 40 * scale;
    // const innerPad = 18 * scale;

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: cardWidth,
          height: cardHeight,
          backgroundColor: card.cardBg,
          borderRadius: cardBorderRadius,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: innerPad,
          color: card.textColor,
          overflow: 'hidden',
        }}
      >
        {/* Top row: emojis left, profile image right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {formatTextWithAppleEmojis(card.emojis, emojiSize)}
          </div>

          {card.profileImage ? (
            <div style={{ display: 'flex', position: 'relative' }}>
              <img
                src={card.profileImage}
                width={profileSize}
                height={profileSize}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                alt=""
              />
              {card.notificationCount && card.notificationCount > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    top: -8 * scale,
                    right: -8 * scale,
                    width: 24 * scale,
                    height: 24 * scale,
                    borderRadius: '50%',
                    backgroundColor: '#ff3b30',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13 * scale,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {card.notificationCount}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Description text — pushed to bottom */}
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'flex-end',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.25,
            overflow: 'hidden',
            paddingTop: 10 * scale,
          }}
        >
          {card.title}
        </div>

        {/* Time stamp */}
        {card.time ? (
          <div
            style={{
              display: 'flex',
              fontSize: 13 * scale,
              fontWeight: 600,
              opacity: 0.5,
              marginTop: 6 * scale,
            }}
          >
            {card.time}
          </div>
        ) : null}
      </div>
    );
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#1a1a1a',
          borderRadius: 40 * scale,
          position: 'relative',
        }}
      >
        {cards.slice(0, 6).map((card, i) => renderCard(card, i))}
      </div>
    ),
    {
      width: imgWidth,
      height: imgHeight,
      fonts:
        fontBold && fontMedium
          ? [
              { name: 'SF Pro Display', data: fontBold, weight: 700, style: 'normal' as const },
              { name: 'SF Pro Display', data: fontMedium, weight: 400, style: 'normal' as const },
            ]
          : undefined,
    },
  );
}