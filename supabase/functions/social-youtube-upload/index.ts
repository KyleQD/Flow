// deno-lint-ignore-file no-explicit-any

interface UploadBody {
  uploadUrl: string
  sourceUrl: string
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  try {
    const { uploadUrl, sourceUrl } = await req.json() as UploadBody
    if (!uploadUrl || !sourceUrl) return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 })

    const head = await fetch(sourceUrl, { method: 'HEAD' })
    const contentType = head.headers.get('content-type') || 'video/*'
    const getRes = await fetch(sourceUrl)
    if (!getRes.ok) return new Response(JSON.stringify({ error: 'fetch_failed', status: getRes.status }), { status: 500 })
    const buf = new Uint8Array(await getRes.arrayBuffer())

    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'content-type': contentType,
        'content-length': String(buf.byteLength)
      },
      body: buf
    })

    const text = await put.text()
    if (!put.ok && put.status !== 201 && put.status !== 200) {
      return new Response(JSON.stringify({ error: 'upload_failed', status: put.status, body: text }), { status: 500 })
    }
    return new Response(JSON.stringify({ success: true, status: put.status, body: text }), { headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown' }), { status: 500 })
  }
}

Deno.serve(handler)


