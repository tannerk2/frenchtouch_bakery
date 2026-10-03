'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return children
}
