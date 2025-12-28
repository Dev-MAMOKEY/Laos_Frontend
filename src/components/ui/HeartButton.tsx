import type { MouseEventHandler } from 'react'

export default function HeartButton({
  active,
  onClick,
  ariaLabel,
  title,
  disabled,
}: {
  active: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={ariaLabel}
      title={title}
    >
      <svg
        viewBox="0 0 24 24"
        className={'h-5 w-5 ' + (active ? 'fill-blue-600' : 'fill-none')}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 21s-7.2-4.6-9.5-8.6C.4 9.1 2.4 5.9 6 5.4c1.8-.3 3.4.5 4.5 1.8 1.1-1.3 2.7-2.1 4.5-1.8 3.6.5 5.6 3.7 3.5 7-2.3 4-9.5 8.6-9.5 8.6z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
