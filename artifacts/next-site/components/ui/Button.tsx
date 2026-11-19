import Link from 'next/link'

const base =
  'font-heading font-bold text-sm rounded-md px-5 py-3 transition-colors inline-block text-center'

const variants = {
  primary: 'bg-brand-red text-paper hover:bg-[#770000]',
  secondary:
    'bg-transparent border-2 border-paper text-paper hover:bg-paper hover:text-ink',
}

interface ButtonBaseProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string
  external?: boolean
  disabled?: never
  type?: never
  onClick?: never
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never
  external?: never
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

type ButtonProps = ButtonAsLink | ButtonAsButton

export default function Button({
  variant,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`.trim()

  if ('href' in rest && rest.href) {
    if (rest.external) {
      return (
        <a href={rest.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      )
    }
    return (
      <Link href={rest.href} className={cls}>
        {children}
      </Link>
    )
  }

  const { disabled, type, onClick } = rest as ButtonAsButton
  return (
    <button
      type={type ?? 'button'}
      disabled={disabled}
      onClick={onClick}
      className={cls}
    >
      {children}
    </button>
  )
}
