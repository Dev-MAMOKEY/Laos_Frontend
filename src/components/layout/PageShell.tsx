import type { ReactNode } from 'react'

export default function PageShell({
  children,
  outerClassName,
  innerClassName,
}: {
  children: ReactNode
  outerClassName?: string
  innerClassName?: string
}) {
  return (
    <div className={`min-h-screen bg-slate-50 px-4 ${outerClassName ?? 'py-8'}`}>
      <div className={`mx-auto w-full max-w-md ${innerClassName ?? ''}`}>{children}</div>
    </div>
  )
}
