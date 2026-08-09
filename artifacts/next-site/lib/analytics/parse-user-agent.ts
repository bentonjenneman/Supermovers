export function parseUserAgent(ua: string | null): {
  device: string
  browser: string
} {
  if (!ua) return { device: 'Unknown', browser: 'Unknown' }

  // Device — checked before browser
  let device: string
  if (/Mobile|iPhone/i.test(ua)) {
    device = 'Mobile'
  } else if (/iPad|Tablet/i.test(ua)) {
    device = 'Tablet'
  } else {
    device = 'Desktop'
  }

  // Browser — order matters: Edge must precede Chrome (Edge UAs contain "Chrome/")
  // and Chrome must precede Safari (Safari UAs also contain "Safari/")
  let browser: string
  if (/Edg\//.test(ua)) {
    browser = 'Edge'
  } else if (/Chrome\//.test(ua)) {
    browser = 'Chrome'
  } else if (/Safari\//.test(ua)) {
    browser = 'Safari'
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox'
  } else {
    browser = 'Other'
  }

  return { device, browser }
}
