import { ImageResponse } from '@vercel/og'
import { typeResults, isValidMBTIType } from '@/lib/mbti-data'

export const runtime = 'edge'

// アイコンのSVGパス
const iconPaths: Record<string, string> = {
  BookOpen:
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  Heart:
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  Compass:
    'M16.24 7.76a6 6 0 0 1-8.48 8.48m8.48-8.48a6 6 0 0 0-8.48 8.48m8.48-8.48L14.5 14.5 9.76 16.24l1.74-4.74m4.74-4.74L9.76 16.24 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  Target:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  Wrench:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  Palette:
    'M12 2a10 10 0 0 0 0 20c.55 0 1 .45 1 1v-3c0-.55.45-1 1-1h3a10 10 0 0 0-5-17zm-4 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  Moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  Brain:
    'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z',
  Zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  PartyPopper:
    'M5.8 11.3 2 22l10.7-3.79 M4 3h.01 M22 8h.01 M15 2h.01 M22 20h.01 M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10 M22 13l-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17 M11 2l.33.82c.34.86-.2 1.82-1.11 1.98-.7.11-1.22.72-1.22 1.43V7',
  Rocket:
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  Lightbulb:
    'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4',
  Briefcase:
    'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10z M12 12v.01',
  Users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  Sparkles:
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z M20 3v4 M22 5h-4 M4 17v2 M5 18H3',
  Crown:
    'M12 6l4 6 5-4-2 10H5L3 8l5 4 4-6z M5 22h14',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')?.toUpperCase() || 'INTJ'

  if (!isValidMBTIType(type)) {
    return new Response('Invalid MBTI type', { status: 400 })
  }

  const typeData = typeResults[type]
  const iconPath = iconPaths[typeData.icon] || iconPaths.Sparkles

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
          backgroundColor: '#F4F9F7',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: `linear-gradient(180deg, ${typeData.color} 0%, ${typeData.color}dd 100%)`,
            display: 'flex',
          }}
        />

        {/* Main card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: '48px 64px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            width: '90%',
            maxWidth: '1000px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                fontSize: '24px',
                color: '#5DDFC3',
                fontWeight: 'bold',
              }}
            >
              受験生タイプ診断
            </span>
          </div>

          {/* Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              backgroundColor: typeData.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={iconPath} />
            </svg>
          </div>

          {/* Type */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: typeData.color,
              marginBottom: '8px',
            }}
          >
            {type}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#3A405A',
              marginBottom: '24px',
            }}
          >
            {typeData.title}
          </div>

          {/* Strengths */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {typeData.strengths.map((strength, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#E0F7F1',
                  color: '#3A405A',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  fontSize: '24px',
                }}
              >
                {strength}
              </div>
            ))}
          </div>

          {/* Roopy branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                color: '#3A405A',
                fontWeight: 'bold',
              }}
            >
              Roopy
            </span>
            <span
              style={{
                fontSize: '20px',
                color: '#3A405A',
                opacity: 0.7,
                marginLeft: '12px',
              }}
            >
              大学受験を"ゲームする"
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
