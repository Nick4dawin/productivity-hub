'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { CurrencyProvider } from '@/contexts/currency-context'
import { AuthProvider } from '@/lib/auth'
import { ClerkProvider } from '@clerk/nextjs'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
