/*
 Minimal e2e harness to validate provider posting paths via Edge Function.
 Usage:
  SUPABASE_URL=... SUPABASE_ANON_KEY=... USER_JWT=... npx tsx scripts/e2e-social-harness.ts
*/

import 'dotenv/config'
import fetch from 'node-fetch'

function getEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

async function main() {
  const supabaseUrl = getEnv('SUPABASE_URL')
  const anon = getEnv('SUPABASE_ANON_KEY')
  const userJwt = getEnv('USER_JWT')

  const url = `${supabaseUrl}/functions/v1/social-post`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${userJwt}`,
      // Supabase Edge respects anon key via Authorization header; userJwt must be a valid session JWT
      'x-client-info': 'e2e-social-harness'
    },
    body: JSON.stringify({
      content: 'Test post from harness',
      mediaUrls: [],
      targets: ['facebook','instagram','youtube','tiktok','twitter'],
      overrides: {
        twitter: { content: 'Twitter short msg from harness' }
      },
      dryRun: true
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`social-post failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  // eslint-disable-next-line no-console
  console.log('social-post dry-run results:', JSON.stringify(json, null, 2))

  const analyticsUrl = `${supabaseUrl}/functions/v1/social-analytics`
  const resAnalytics = await fetch(analyticsUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${userJwt}`,
    },
    body: JSON.stringify({})
  })
  if (!resAnalytics.ok) {
    const text = await resAnalytics.text()
    throw new Error(`social-analytics failed: ${resAnalytics.status} ${text}`)
  }
  const analyticsJson = await resAnalytics.json()
  // eslint-disable-next-line no-console
  console.log('social-analytics result:', analyticsJson)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})


