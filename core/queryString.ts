/** Convert an object into an encoded query string. Array values repeat the key. */
export function generateQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  const appendValue = (key: string, value: unknown): void => {
    if (value === null || value === undefined) return

    if (Array.isArray(value)) {
      for (const item of value) appendValue(key, item)
    } else if (typeof value === 'object') {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        appendValue(`${key}[${nestedKey}]`, nestedValue)
      }
    } else {
      searchParams.append(key, String(value))
    }
  }

  for (const [key, value] of Object.entries(params)) appendValue(key, value)

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}
