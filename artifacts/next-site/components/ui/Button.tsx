import Link from 'next/link'

const base =
  'font-heading font-bold text-sm rounded-md px-5 py-3 transition-colors inline-block text-center'

const variants = {
  primary: 'bg-brand-orange text-white hover:bg-[#B83725]',
  secondary:
    'bg-transparent border-2 border-ink text-ink hover:bg-ink hover:text-white',
}

interface ButtonBaseProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string
  disabled?: never
  type?: never
  onClick?: never
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never
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
