import Link from 'next/link'
import styles from './HowItWorks.module.css'

const steps = [
  {
    number: '01',
    label: 'Let’s make a plan',
    title: 'Request a Quote',
    description: 'Call or submit online. We discuss your needs and provide a clear quote with no hidden fees.',
    icon: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /><path d="M8 10h8M8 14h5" /></>,
  },
  {
    number: '02',
    label: 'Count on your crew',
    title: 'We Arrive on Time',
    description: 'Our equipped truck and crew arrive ready to work. We wrap and protect your items before moving.',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  },
  {
    number: '03',
    label: 'You’re in good hands',
    title: 'Safe Transport',
    description: 'We transport, unload, and place your items where you need them, with care at every step.',
    icon: <><path d="M3 5h11v12H3zM14 9h4l3 4v4h-7M3 10h11" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="how-it-works-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Three simple steps</p>
          <h2 id="how-it-works-heading">How It Works</h2>
          <div className={styles.underline} aria-hidden="true" />
          <p>We keep things simple, straightforward, and professional from the first call to the final box.</p>
        </header>
        <ol className={styles.steps} role="list">
          {steps.map(step => (
            <li className={styles.step} key={step.number}>
              <span className={styles.marker} aria-hidden="true">{step.number}</span>
              <div className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.label}>{step.label}</span>
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{step.icon}</svg>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.cta}>
          <div>
            <h3>Ready for your SuperMove?</h3>
            <p>It all starts with a free quote.</p>
          </div>
          <Link className={styles.button} href="/quote">
            Start your move today
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
