interface BadgeProps {
  label: string
  accent: 'orange' | 'blue'
}

const borderClass = {
  orange: 'border-brand-red',
  blue: 'border-brand-blue',
}

export default function Badge({ label, accent }: BadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-20 h-20 rounded-full border-2 ${borderClass[accent]} bg-surface flex items-center justify-center`}
      >
        <span
          className="font-heading font-bold text-xs text-paper text-center leading-tight px-1"
        >
          {label}
        </span>
      </div>
    </div>
  )
}
