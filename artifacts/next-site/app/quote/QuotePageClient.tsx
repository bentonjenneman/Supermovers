'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import {
  EMPTY_QUOTE,
  buildQuotePayload,
  getTodayISO,
  isSelectableMoveDate,
  validateQuoteStep,
  type QuoteErrors,
  type QuoteFields,
  type QuoteStep,
} from '@/lib/quote-form'
import { SERVICE_CARDS, findService } from '@/lib/service-cards'
import styles from './QuotePage.module.css'

const stepNames: Record<QuoteStep, string> = {
  1: 'Your details',
  2: 'The move',
  3: 'Preferred date',
}

function localISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateFromISO(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  if (!value) return 'Not selected'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateFromISO(value))
}

function firstErrorField(errors: QuoteErrors): keyof QuoteFields | undefined {
  return (['name', 'email', 'phone', 'move_type', 'origin_address', 'destination_address', 'notes', 'move_date'] as const)
    .find((key) => Boolean(errors[key]))
}

function QuoteCalendar({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (date: string) => void
  error?: string
}) {
  const today = getTodayISO()
  const initial = isSelectableMoveDate(value, today) ? dateFromISO(value) : dateFromISO(today)
  const [month, setMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [focusDate, setFocusDate] = useState<string | null>(null)

  useEffect(() => {
    if (!focusDate) return
    document.getElementById(`quote-date-${focusDate}`)?.focus()
    setFocusDate(null)
  }, [focusDate, month])

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const monthDays = new Date(year, monthIndex + 1, 0).getDate()
  const monthTitle = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(month)
  const canGoBack = localISO(new Date(year, monthIndex, 1)) > today.slice(0, 7) + '-01'
  const days = Array.from({ length: monthDays }, (_, index) => index + 1)
  const previousMonth = () => setMonth(new Date(year, monthIndex - 1, 1))
  const nextMonth = () => setMonth(new Date(year, monthIndex + 1, 1))

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, day: number) {
    const current = new Date(year, monthIndex, day)
    let target: Date | null = null
    if (event.key === 'ArrowLeft') target = new Date(year, monthIndex, day - 1)
    if (event.key === 'ArrowRight') target = new Date(year, monthIndex, day + 1)
    if (event.key === 'ArrowUp') target = new Date(year, monthIndex, day - 7)
    if (event.key === 'ArrowDown') target = new Date(year, monthIndex, day + 7)
    if (event.key === 'Home') target = new Date(year, monthIndex, day - ((current.getDay() + 6) % 7))
    if (event.key === 'End') target = new Date(year, monthIndex, day + (6 - ((current.getDay() + 6) % 7)))
    if (event.key === 'PageUp') target = new Date(year, monthIndex - 1, day)
    if (event.key === 'PageDown') target = new Date(year, monthIndex + 1, day)
    if (!target) return
    event.preventDefault()
    while (localISO(target) < today) target = new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1)
    const targetISO = localISO(target)
    setMonth(new Date(target.getFullYear(), target.getMonth(), 1))
    setFocusDate(targetISO)
  }

  return (
      <div className={styles.calendarWrap} aria-describedby={error ? 'move_date-error' : undefined}>
      <div className={styles.calendarHeading}>
        <div>
          <span className={styles.calendarKicker}>Pick a day that works for you</span>
          <h3 className={styles.monthTitle} aria-live="polite">{monthTitle}</h3>
        </div>
        <div className={styles.monthControls}>
          <button type="button" onClick={previousMonth} disabled={!canGoBack} aria-label="Previous month" className={styles.monthButton} data-testid="button-previous-month">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5 5 5" /></svg>
          </button>
          <button type="button" onClick={nextMonth} aria-label="Next month" className={styles.monthButton} data-testid="button-next-month">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5-5 5" /></svg>
          </button>
        </div>
      </div>
      <div className={styles.calendarGrid} role="group" aria-label={`Choose a preferred move date, ${monthTitle}`}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((weekday) => (
          <div className={styles.weekday} key={weekday}>
            <span aria-label={weekday}>{weekday}</span>
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span className={styles.calendarBlank} role="presentation" key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const date = new Date(year, monthIndex, day)
          const dateISO = localISO(date)
          const disabled = !isSelectableMoveDate(dateISO, today)
          const selected = value === dateISO
          const label = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(date)
          return (
            <button
              type="button"
              id={`quote-date-${dateISO}`}
              key={dateISO}
              disabled={disabled}
              aria-label={label}
              aria-pressed={selected}
              aria-current={dateISO === today ? 'date' : undefined}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'move_date-error' : undefined}
              onClick={() => onChange(dateISO)}
              onKeyDown={(event) => moveFocus(event, day)}
              className={`${styles.dayButton} ${selected ? styles.selectedDay : ''} ${dateISO === today ? styles.todayDay : ''}`}
              data-testid={`button-date-${dateISO}`}
            >
              {day}
            </button>
          )
        })}
      </div>
      <div className={styles.dateNote}>
        <span className={styles.dateDot} aria-hidden="true" />
        <p>This is your preferred date, not a reservation. Our team will confirm availability with you.</p>
      </div>
      {error && <p className={styles.fieldError} id="move_date-error" role="alert">{error}</p>}
    </div>
  )
}

export default function GetAQuote({ initialMoveType }: { initialMoveType: string }) {
  const [fields, setFields] = useState<QuoteFields>(() => ({ ...EMPTY_QUOTE, move_type: initialMoveType }))
  const [step, setStep] = useState<QuoteStep>(1)
  const [summary, setSummary] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focusField, setFocusField] = useState<keyof QuoteFields | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const submitGuard = useRef(false)

  useEffect(() => {
    if (submitted) document.getElementById('quote-success-title')?.focus()
  }, [submitted])

  useEffect(() => {
    headingRef.current?.focus()
  }, [step, summary])

  useEffect(() => {
    if (!focusField) return
    if (focusField === 'move_date') {
      const selected = document.getElementById(`quote-date-${fields.move_date || getTodayISO()}`) as HTMLButtonElement | null
      const target = selected && !selected.disabled
        ? selected
        : document.querySelector<HTMLButtonElement>('[id^="quote-date-"]:not(:disabled)')
      target?.focus()
    } else {
      document.getElementById(`quote-${focusField}`)?.focus()
    }
    setFocusField(null)
  }, [focusField, step, summary, fields.move_date])

  function updateField(key: keyof QuoteFields) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value
      setFields((current) => ({ ...current, [key]: value }))
      setErrors((current) => {
        if (!current[key]) return current
        const next = { ...current }
        delete next[key]
        return next
      })
      setRequestError(null)
    }
  }

  function validateStep(currentStep: QuoteStep) {
    const nextErrors = validateQuoteStep(currentStep, fields)
    setErrors((previous) => {
      const next = { ...previous }
      for (const key of Object.keys(nextErrors) as (keyof QuoteFields)[]) next[key] = nextErrors[key]
      return next
    })
    const first = firstErrorField(nextErrors)
    if (first) {
      setFocusField(first)
      return false
    }
    return true
  }

  function continueStep() {
    if (!validateStep(step)) return
    setErrors({})
    setRequestError(null)
    if (editingSummary) {
      setSummary(true)
      setEditingSummary(false)
      return
    }
    if (step < 3) setStep((step + 1) as QuoteStep)
    else {
      setSummary(true)
      setEditingSummary(false)
    }
  }

  function editStep(target: QuoteStep) {
    if (submitGuard.current) return
    setErrors({})
    setRequestError(null)
    setStep(target)
    setSummary(false)
    setEditingSummary(true)
  }

  function goBack() {
    if (submitGuard.current) return
    setErrors({})
    setRequestError(null)
    if (editingSummary) {
      setSummary(true)
      setEditingSummary(false)
    } else if (step > 1) {
      setStep((step - 1) as QuoteStep)
    }
  }

  async function sendQuote() {
    if (submitGuard.current || loading) return
    setErrors({})
    setRequestError(null)
    const stepOrder: QuoteStep[] = [1, 2, 3]
    for (const currentStep of stepOrder) {
      const found = validateQuoteStep(currentStep, fields)
      if (Object.keys(found).length) {
        setErrors(found)
        const first = firstErrorField(found)
        if (first) {
          setStep(currentStep)
          setSummary(false)
          setEditingSummary(true)
          setFocusField(first)
        }
        return
      }
    }
    submitGuard.current = true
    setLoading(true)
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildQuotePayload(fields)),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setRequestError(
          (data as { error?: string }).error ?? 'Something went wrong. Please try again.',
        )
        submitGuard.current = false
        return
      }
      setSubmitted(true)
    } catch {
      setRequestError('Network error. Please check your connection and try again.')
      submitGuard.current = false
    } finally {
      setLoading(false)
    }
  }

  function preventImplicitSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  if (submitted) {
    return (
      <main className={styles.page}>
        <section className={styles.success} aria-labelledby="quote-success-title">
          <h1 id="quote-success-title" tabIndex={-1} className={styles.successTitle}>Quote Sent</h1>
          <p className={styles.successText}>We will respond Super fast.</p>
          <div className={styles.successRule} aria-hidden="true" />
        </section>
        <img
          className={styles.heroFlight}
          src="/logo.png"
          alt=""
          aria-hidden="true"
          data-testid="img-success-superhero"
        />
      </main>
    )
  }

  const progress = summary ? 3 : step
  const activeErrors = Object.values(errors).filter(Boolean)

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}><span className={styles.eyebrowMark} /> Athens, GA • Moving Made Easy</span>
            <h1>Get Your Super Quote</h1>
            <p>Tell our crew what you have in mind. We’ll make the next move feel easy.</p>
          </div>
          <div className={styles.introSweep} aria-hidden="true" />
        </div>
      </header>

      <section className={styles.formSection} aria-label="Quote request">
        <div className={styles.formShell}>
          <nav className={styles.progress} aria-label="Quote progress">
            {([1, 2, 3] as QuoteStep[]).map((item) => (
              <div
                className={`${styles.progressItem} ${progress === item ? styles.progressCurrent : ''} ${progress > item ? styles.progressComplete : ''}`}
                key={item}
                aria-current={progress === item ? 'step' : undefined}
              >
                <span className={styles.progressNumber}>{progress > item ? '✓' : `0${item}`}</span>
                <span className={styles.progressLabel}>{stepNames[item]}</span>
              </div>
            ))}
          </nav>

          <form onSubmit={preventImplicitSubmit} noValidate className={styles.formCard}>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="quote-hp">Leave this field blank</label>
              <input
                id="quote-hp"
                type="text"
                name="_hp"
                value={fields._hp}
                onChange={updateField('_hp')}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className={styles.formTopline}>
              <span>{summary ? 'One last look' : `Step 0${step} / 03`}</span>
              <span className={styles.requiredNote}>All fields required</span>
            </div>

            {summary ? (
              <div className={styles.stepPanel} key="summary">
                <div className={styles.stepHeading}>
                  <span className={styles.stepIndex}>READY WHEN YOU ARE</span>
                  <h2 ref={headingRef} tabIndex={-1}>Review your move</h2>
                  <p>Make sure we’ve got it right. Want to change something? Jump back to any step.</p>
                </div>
                <div className={styles.summaryList}>
                  <section className={styles.summaryBlock}>
                    <div className={styles.summaryHead}>
                      <div><span>01</span><h3>Your details</h3></div>
                      <button type="button" disabled={loading} aria-label="Edit your details" onClick={() => editStep(1)} className={styles.editButton} data-testid="button-edit-step-1">Edit</button>
                    </div>
                    <dl className={styles.summaryGrid}>
                      <div><dt>Name</dt><dd>{fields.name}</dd></div>
                      <div><dt>Email</dt><dd>{fields.email}</dd></div>
                      <div><dt>Phone</dt><dd>{fields.phone}</dd></div>
                    </dl>
                  </section>
                  <section className={styles.summaryBlock}>
                    <div className={styles.summaryHead}>
                      <div><span>02</span><h3>The move</h3></div>
                      <button type="button" disabled={loading} aria-label="Edit move information" onClick={() => editStep(2)} className={styles.editButton} data-testid="button-edit-step-2">Edit</button>
                    </div>
                    <dl className={styles.summaryGrid}>
                      <div className={styles.summaryWide}><dt>Move Type</dt><dd>{findService(fields.move_type)?.name}</dd></div>
                      <div><dt>Home Address</dt><dd>{fields.origin_address}</dd></div>
                      <div><dt>Move Address</dt><dd>{fields.destination_address}</dd></div>
                      <div className={styles.summaryWide}><dt>Move Information</dt><dd>{fields.notes}</dd></div>
                    </dl>
                  </section>
                  <section className={styles.summaryBlock}>
                    <div className={styles.summaryHead}>
                      <div><span>03</span><h3>Schedule Your Move</h3></div>
                      <button type="button" disabled={loading} aria-label="Edit preferred date" onClick={() => editStep(3)} className={styles.editButton} data-testid="button-edit-step-3">Edit</button>
                    </div>
                    <dl className={styles.summaryGrid}>
                      <div><dt>Preferred date</dt><dd>{formatDate(fields.move_date)}</dd></div>
                    </dl>
                  </section>
                </div>
                <p className={styles.summaryAvailability}>Your preferred date is a request, not a reservation. We’ll confirm availability when we get back to you.</p>
                {requestError && <p className={styles.requestError} role="alert">{requestError}</p>}
                <div className={styles.actions}>
                  <button type="button" disabled={loading} onClick={() => { if (!submitGuard.current) { setSummary(false); setEditingSummary(false); setStep(3) } }} className={styles.backButton} data-testid="button-back-to-date">Back</button>
                  <button type="button" onClick={sendQuote} disabled={loading} className={styles.primaryButton} data-testid="button-send-quote">
                    <span>{loading ? 'Sending your request…' : 'Confirm'}</span>
                    {!loading && <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg>}
                  </button>
                </div>
                <p className={styles.privacyNote}>No obligation. Just a real person from our crew getting back to you.</p>
              </div>
            ) : (
              <div className={styles.stepPanel} key={`step-${step}`}>
                <div className={styles.stepHeading}>
                  <span className={styles.stepIndex}>0{step} — {stepNames[step].toUpperCase()}</span>
                  <h2 ref={headingRef} tabIndex={-1}>
                    {step === 1 && 'Who are we helping?'}
                    {step === 2 && 'Tell us about the move'}
                    {step === 3 && 'Schedule Your Move'}
                  </h2>
                  <p>
                    {step === 1 && 'A few details so the right person can reach you.'}
                    {step === 2 && 'The more you can share, the more useful our quote can be.'}
                    {step === 3 && 'Choose your preferred day. We’ll check the crew’s availability with you.'}
                  </p>
                </div>

                {step === 1 && (
                  <div className={styles.fieldStack}>
                    <div className={styles.field}>
                      <label htmlFor="quote-name">Name <span aria-hidden="true">*</span></label>
                      <input id="quote-name" name="name" type="text" autoComplete="name" maxLength={200} required value={fields.name} onChange={updateField('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} data-testid="input-name" />
                      {errors.name && <p className={styles.fieldError} id="name-error">{errors.name}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="quote-email">Email <span aria-hidden="true">*</span></label>
                      <input id="quote-email" name="email" type="email" autoComplete="email" maxLength={254} required value={fields.email} onChange={updateField('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} data-testid="input-email" />
                      {errors.email && <p className={styles.fieldError} id="email-error">{errors.email}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="quote-phone">Phone <span aria-hidden="true">*</span></label>
                      <input id="quote-phone" name="phone" type="tel" autoComplete="tel" maxLength={50} required value={fields.phone} onChange={updateField('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} data-testid="input-phone" />
                      {errors.phone && <p className={styles.fieldError} id="phone-error">{errors.phone}</p>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.fieldStack}>
                    <div className={styles.field}>
                      <label htmlFor="quote-move_type">Move Type <span aria-hidden="true">*</span></label>
                      <select id="quote-move_type" name="move_type" required value={fields.move_type} onChange={updateField('move_type')} aria-invalid={Boolean(errors.move_type)} aria-describedby={errors.move_type ? 'move_type-error' : undefined}>
                        <option value="" disabled>Select a move type</option>
                        {SERVICE_CARDS.map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
                      </select>
                      {errors.move_type && <p className={styles.fieldError} id="move_type-error">{errors.move_type}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="quote-origin_address">Home Address <span aria-hidden="true">*</span></label>
                      <input id="quote-origin_address" name="origin_address" type="text" autoComplete="street-address" maxLength={1000} required placeholder="Where are we picking things up?" value={fields.origin_address} onChange={updateField('origin_address')} aria-invalid={Boolean(errors.origin_address)} aria-describedby={errors.origin_address ? 'origin_address-error' : undefined} data-testid="input-origin-address" />
                      {errors.origin_address && <p className={styles.fieldError} id="origin_address-error">{errors.origin_address}</p>}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="quote-destination_address">Move Address <span aria-hidden="true">*</span></label>
                      <input id="quote-destination_address" name="destination_address" type="text" autoComplete="street-address" maxLength={1000} required placeholder="Where are we taking everything?" value={fields.destination_address} onChange={updateField('destination_address')} aria-invalid={Boolean(errors.destination_address)} aria-describedby={errors.destination_address ? 'destination_address-error' : undefined} data-testid="input-destination-address" />
                      {errors.destination_address && <p className={styles.fieldError} id="destination_address-error">{errors.destination_address}</p>}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <label htmlFor="quote-notes">Move Information <span aria-hidden="true">*</span></label>
                        <span className={styles.labelHint}>A little detail goes a long way</span>
                      </div>
                      <textarea id="quote-notes" name="notes" maxLength={10000} required rows={5} placeholder="Tell us about the home size, stairs or elevators, big furniture, fragile items, timing — anything that helps us picture the move." value={fields.notes} onChange={updateField('notes')} aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'notes-error' : 'notes-hint'} data-testid="input-move-information" />
                      <span id="notes-hint" className={styles.helperText}>More detail helps our crew come back with a more accurate quote.</span>
                      {errors.notes && <p className={styles.fieldError} id="notes-error">{errors.notes}</p>}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <QuoteCalendar
                    value={fields.move_date}
                    onChange={(move_date) => {
                      setFields((current) => ({ ...current, move_date }))
                      setErrors((current) => ({ ...current, move_date: undefined }))
                    }}
                    error={errors.move_date}
                  />
                )}

                <div className={styles.actions}>
                  {step > 1 && <button type="button" onClick={goBack} className={styles.backButton} data-testid="button-back">Back</button>}
                  {step === 1 && <span className={styles.actionSpacer} />}
                  <button type="button" onClick={continueStep} className={styles.primaryButton} data-testid={step === 3 ? 'button-confirm-date' : 'button-continue'}>
                    <span>{step === 3 ? 'Confirm' : editingSummary ? 'Save and return to review' : 'Continue'}</span>
                    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg>
                  </button>
                </div>
                <div className={styles.formAssurance}>
                  <span>© SuperMovers LLC</span>
                </div>
              </div>
            )}
          </form>
          <div className={styles.errorLiveRegion} aria-live="polite" aria-atomic="true">
            {activeErrors.length > 0 && 'Please check the highlighted fields.'}
          </div>
        </div>
      </section>
    </main>
  )
}
