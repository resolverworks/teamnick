import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const schema = z.object({
  id: z.string().regex(/^[0-9]+$/),
})

const PROD_URL = 'teamnick.xyz'
const baseUrl = process.env.VERCEL_URL
  ? `https://${PROD_URL}`
  : 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error)
  }

  const { id } = safeParse.data

  const queryParams = new URLSearchParams({
    'cache-bust': Date.now().toString(),
  })
  const nameJson = await fetch(
    `https://namestone.xyz/api/public_v1/get-name-by-token-id?domain=teamnick.eth&token_id=${id}&${queryParams.toString()}`,
    { method: 'GET' }
  )

  let profile = null
  if (nameJson.status === 200) profile = (await nameJson.json()) as any

  if (!profile) {
    return NextResponse.json({ error: 'Invalid token id' }, { status: 404 })
  }

  return NextResponse.json({
    name: profile.name,
    description: 'Subname of teamnick.eth',
    image: `${baseUrl}/nft/${id}/image`,
  })
}
