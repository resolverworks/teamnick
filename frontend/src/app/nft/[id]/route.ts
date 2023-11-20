import { getNameByTokenId } from '@/lib/ponder'
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

  const name = await getNameByTokenId(id)

  if (!name) {
    return NextResponse.json({ error: 'Invalid token id' }, { status: 404 })
  }

  return NextResponse.json({
    name: name.name + '.teamnick.eth',
    description: 'Subname of teamnick.eth',
    image: `${baseUrl}/nft/${id}/image`,
  })
}
