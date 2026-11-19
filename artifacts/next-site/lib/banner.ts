export interface BannerSettings {
  title: string
  subtitle: string
  link: string
}

export const EMPTY_BANNER: BannerSettings = { title: '', subtitle: '', link: '' }

export function validateBanner(value: unknown): { data: BannerSettings } | { error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { error: 'Invalid banner settings.' }
  const body = value as Record<string, unknown>
  if (typeof body.title !== 'string' || typeof body.subtitle !== 'string' || typeof body.link !== 'string') {
    return { error: 'Title, Subtitle, and Link must be text.' }
  }
  const title = body.title.trim()
  const subtitle = body.subtitle.trim()
  let link = body.link.trim()
  if (title.length > 160 || subtitle.length > 300 || link.length > 2048) {
    return { error: 'Use up to 160 characters for Title, 300 for Subtitle, and 2048 for Link.' }
  }
  if (link) {
    if (/[\u0000-\u0020\u007f\\]/.test(link)) return { error: 'Enter a valid website link or a page path such as /quote.' }
    try {
      if (link.startsWith('/') && !link.startsWith('//')) {
        if (new URL(link, 'https://banner.invalid').origin !== 'https://banner.invalid') throw new Error()
      } else {
        if (!/^https?:\/\//i.test(link)) throw new Error()
        const url = new URL(link)
        if (url.username || url.password) throw new Error()
        link = url.href
      }
    } catch {
      return { error: 'Use an http:// or https:// website link, or a page path such as /quote.' }
    }
  }
  return { data: { title, subtitle, link } }
}
