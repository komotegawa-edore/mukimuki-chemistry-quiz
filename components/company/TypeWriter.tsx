'use client'

import { useState, useEffect } from 'react'

interface TypeWriterProps {
  texts: string[]
  className?: string
  speed?: number
  deleteSpeed?: number
  pauseTime?: number
}

export default function TypeWriter({
  texts,
  className = '',
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentText = texts[textIndex]

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseTime)
      return () => clearTimeout(pauseTimer)
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false)
        setTextIndex((prev) => (prev + 1) % texts.length)
        return
      }

      const deleteTimer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, deleteSpeed)
      return () => clearTimeout(deleteTimer)
    }

    if (displayText === currentText) {
      setIsPaused(true)
      return
    }

    const typeTimer = setTimeout(() => {
      setDisplayText(currentText.slice(0, displayText.length + 1))
    }, speed)

    return () => clearTimeout(typeTimer)
  }, [displayText, textIndex, isDeleting, isPaused, texts, speed, deleteSpeed, pauseTime])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
