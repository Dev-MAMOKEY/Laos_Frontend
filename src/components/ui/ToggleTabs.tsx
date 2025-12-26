export type ToggleTab<T extends string> = {
  value: T
  label: string
}

export default function ToggleTabs<T extends string>({
  value,
  onChange,
  left,
  right,
}: {
  value: T
  onChange: (value: T) => void
  left: ToggleTab<T>
  right: ToggleTab<T>
}) {
  const activeClass = 'border-blue-600 bg-blue-600 text-white'
  const inactiveClass = 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(left.value)}
        className={
          'rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ' +
          (value === left.value ? activeClass : inactiveClass)
        }
      >
        {left.label}
      </button>
      <button
        type="button"
        onClick={() => onChange(right.value)}
        className={
          'rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-colors ' +
          (value === right.value ? activeClass : inactiveClass)
        }
      >
        {right.label}
      </button>
    </div>
  )
}
