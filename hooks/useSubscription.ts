'use client'

import { useState, useEffect } from 'react'

interface SubscriptionInfo {
  status: string
  planType: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface SubscriptionState {
  hasAccess: boolean
  subscription: SubscriptionInfo | null
  loading: boolean
  error: string | null
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    hasAccess: false,
    subscription: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/english/subscription')
        const data = await res.json()

        setState({
          hasAccess: data.hasAccess,
          subscription: data.subscription,
          loading: false,
          error: data.error || null,
        })
      } catch (error) {
        setState({
          hasAccess: false,
          subscription: null,
          loading: false,
          error: 'Failed to check subscription',
        })
      }
    }

    checkSubscription()
  }, [])

  return state
}
