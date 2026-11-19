import { findService } from '@/lib/service-cards'

export interface QuoteFields {
  name: string
  email: string
  phone: string
  move_type: string
  origin_address: string
  destination_address: string
  notes: string
  move_date: string
  _hp: string
}

export type QuoteStep = 1 | 2 | 3
export type QuoteErrors = Partial<Record<keyof QuoteFields, string>>

export const EMPTY_QUOTE: QuoteFields = {
  name: '',
  email: '',
  phone: '',
  move_type: '',
  origin_address: '',
  destination_address: '',
  notes: '',
  move_date: '',
  _hp: '',
}

/** Local calendar date, without a UTC conversion that can change the day. */
export function getTodayISO(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function isSelectableMoveDate(value: string, today = getTodayISO()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return getTodayISO(parsed) === value && value >= today
}

export function validateQuoteStep(step: QuoteStep, fields: QuoteFields): QuoteErrors {
  const errors: QuoteErrors = {}
  if (step === 1) {
    if (!fields.name.trim()) errors.name = 'Please enter your name.'
    else if (fields.name.trim().length > 200) errors.name = 'Please use 200 characters or fewer.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) || fields.email.trim().length > 254) {
      errors.email = 'Please enter a valid email address.'
    }
    if (fields.phone.replace(/\D/g, '').length < 7 || fields.phone.length > 50) {
      errors.phone = 'Please enter a valid phone number.'
    }
  }
  if (step === 2) {
    if (!findService(fields.move_type)) errors.move_type = 'Please choose a move type.'
    if (!fields.origin_address.trim()) errors.origin_address = 'Please enter your home address.'
    else if (fields.origin_address.trim().length > 1000) errors.origin_address = 'Please use 1,000 characters or fewer.'
    if (!fields.destination_address.trim()) errors.destination_address = 'Please enter your move address.'
    else if (fields.destination_address.trim().length > 1000) errors.destination_address = 'Please use 1,000 characters or fewer.'
    if (!fields.notes.trim()) errors.notes = 'Please tell us a little about your move.'
    else if (fields.notes.trim().length > 10000) errors.notes = 'Please use 10,000 characters or fewer.'
  }
  if (step === 3 && !isSelectableMoveDate(fields.move_date)) {
    errors.move_date = 'Please choose today or a future moving date.'
  }
  return errors
}

export function buildQuotePayload(fields: QuoteFields) {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    phone: fields.phone.trim(),
    origin_address: fields.origin_address.trim(),
    destination_address: fields.destination_address.trim(),
    notes: fields.notes.trim(),
    move_date: fields.move_date,
    // The existing quotes table stores this value in move_size.
    move_size: findService(fields.move_type)?.name ?? null,
    _hp: fields._hp,
  }
}
