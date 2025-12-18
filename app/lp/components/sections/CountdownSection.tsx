'use client'

import { useEffect, useState } from 'react'
import { CountdownContent } from '@/app/juku/types'

interface Props {
  content: CountdownContent
  primaryColor: string
  accentColor: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownSection({ content, primaryColor, accentColor }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(content.targetDate).getTime() - Date.now()

      if (difference <= 0) {
        setIsExpired(true)
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [content.targetDate])

  if (isExpired) {
    return (
      <section className="py-8 text-center" style={{ background: '#6b7280' }}>
        <p className="text-xl font-bold text-white">{content.expiredMessage}</p>
      </section>
    )
  }

  if (!timeLeft) {
    return null
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-lg shadow-lg ${
          content.style === 'flip' ? 'bg-gray-900' : ''
        }`}
        style={{
          background: content.style === 'flip' ? '#1f2937' : 'white',
          color: content.style === 'flip' ? 'white' : primaryColor,
        }}
      >
        <span className="text-3xl md:text-5xl font-black">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-sm text-white/80">{label}</span>
    </div>
  )

  return (
    <section
      className="py-8 md:py-12"
      style={{
        background:
          content.style === 'urgent'
            ? `linear-gradient(135deg, ${primaryColor} 0%, #dc2626 100%)`
            : primaryColor,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
          {content.title}
        </h2>

        <div className="flex justify-center gap-3 md:gap-6">
          <TimeBox value={timeLeft.days} label="日" />
          <div className="flex items-center text-3xl md:text-5xl font-bold text-white">
            :
          </div>
          <TimeBox value={timeLeft.hours} label="時間" />
          <div className="flex items-center text-3xl md:text-5xl font-bold text-white">
            :
          </div>
          <TimeBox value={timeLeft.minutes} label="分" />
          <div className="flex items-center text-3xl md:text-5xl font-bold text-white">
            :
          </div>
          <TimeBox value={timeLeft.seconds} label="秒" />
        </div>
      </div>
    </section>
  )
}
