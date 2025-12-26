export default function ProgressBar({
  percent,
}: {
  percent: number
}) {
  const safe = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-blue-500 transition-[width] duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}
