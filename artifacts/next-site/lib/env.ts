import { getRequestContext } from '@cloudflare/next-on-pages'

export function getServerEnv(name: string): string | undefined {
  try {
    const env = getRequestContext().env as Record<string, string | undefined>
    return env[name] ?? process.env[name]
  } catch {
    return process.env[name]
  }
}