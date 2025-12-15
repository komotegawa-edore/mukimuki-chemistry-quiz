'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ManabeeContactForm from './ManabeeContactForm'

function FormWithParams() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const initialType = type === 'document' ? 'document' : 'trial'

  return <ManabeeContactForm initialType={initialType} />
}

export default function ManabeeContactFormWrapper() {
  return (
    <Suspense fallback={<div className="bg-white rounded-3xl p-8 shadow-lg animate-pulse h-[600px]" />}>
      <FormWithParams />
    </Suspense>
  )
}
