import type { ReactNode } from 'react'

export default function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`rounded-2xl bg-white p-6 shadow-lg ${className ?? ''}`}>{children}</div>
}
