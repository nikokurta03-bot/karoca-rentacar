/** Bound memory use for public form endpoints, including chunked requests. */
export async function readFormJson(request: Request): Promise<Record<string, any>> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('JSON required')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  const decoder = new TextDecoder()
  let bytes = 0, text = ''
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 16384) { await reader.cancel(); throw new Error('Request too large') }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally { reader.releaseLock() }
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Object required')
  return data
}
