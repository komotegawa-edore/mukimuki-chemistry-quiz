import { ImageResponse } from '@vercel/og'
import { typeResults, isValidMBTIType } from '@/lib/mbti-data'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')?.toUpperCase() || 'INTJ'

  if (!isValidMBTIType(type)) {
    return new Response('Invalid MBTI type', { status: 400 })
  }

  const typeData = typeResults[type]

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
            background: 'linear-gradient(180deg, #5DDFC3 0%, #4ECFB3 100%)',
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

          {/* Emoji */}
          <div
            style={{
              fontSize: '96px',
              marginBottom: '16px',
            }}
          >
            {typeData.emoji}
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
