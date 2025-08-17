import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { filePath, expiresInSec = 300 } = await req.json()
  if (!filePath) return NextResponse.json({ error: 'filePath required' }, { status: 400 })
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  // We generate pre-signed URL for upload using service role on server actions ideally.
  // Here we fallback to create signed URL for download after upload; for upload use upload via server action.
  const { data, error } = await supabase.storage
    .from('private-docs')
    .createSignedUploadUrl(filePath)

  if (error || !data) return NextResponse.json({ error: 'failed' }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl, token: data.token })
}


