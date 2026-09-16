import 'server-only'
import { ReplitConnectors } from '@replit/connectors-sdk'

interface QuoteAlertDetails {
  name: string
  email: string
  phone: string
  moveDate: string | null
  originAddress: string | null
  destinationAddress: string | null
  moveSize: string | null
}

function buildMessage(quote: QuoteAlertDetails) {
  const moveRoute =
    quote.originAddress && quote.destinationAddress
      ? `${quote.originAddress} to ${quote.destinationAddress}`
      : quote.originAddress || quote.destinationAddress

  return [
    'New Super Movers quote',
    `Name: ${quote.name}`,
    `Phone: ${quote.phone}`,
    `Email: ${quote.email}`,
    quote.moveDate ? `Move date: ${quote.moveDate}` : null,
    quote.moveSize ? `Move size: ${quote.moveSize}` : null,
    moveRoute ? `Route: ${moveRoute}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function sendQuoteAlerts(quote: QuoteAlertDetails) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const from = process.env.TWILIO_PHONE_NUMBER
  const recipients = [process.env.OWNER_PHONE_1, process.env.OWNER_PHONE_2].filter(
    (phone): phone is string => Boolean(phone?.trim()),
  )

  if (!accountSid || !from || recipients.length === 0) {
    console.error('[quote-sms] Missing Twilio SMS configuration')
    return
  }

  const connectors = new ReplitConnectors()
  const message = buildMessage(quote)
  const uniqueRecipients = Array.from(new Set(recipients))

  const results = await Promise.allSettled(
    uniqueRecipients.map(async (to) => {
      const body = new URLSearchParams({
        To: to,
        From: from,
        Body: message,
      })

      const response = await connectors.proxy(
        'twilio',
        `/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Twilio returned ${response.status}: ${errorText}`)
      }
    }),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `[quote-sms] Failed to alert owner recipient ${index + 1}:`,
        result.reason,
      )
    }
  })
}