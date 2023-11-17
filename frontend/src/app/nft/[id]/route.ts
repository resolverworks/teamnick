import { Name, PonderResponse } from '@/hooks/usePonder'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const schema = z.object({
  id: z.string().regex(/^[0-9]+$/),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error)
  }

  const { id } = safeParse.data

  const res = await fetch('https://teamnick.up.railway.app/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        {
          name (id: "${id}") {
            id
            name
            owner
            avatar
            ethAddress
          }
        }
      `,
    }),
  })

  const { data } = (await res.json()) as PonderResponse<{ name: Name }>
  const { name } = data

  if (!name) {
    return NextResponse.json({ error: 'Invalid token id' }, { status: 404 })
  }

  return NextResponse.json({
    name: name.name + '.teamnick.eth',
    description: 'Subname of teamnick.eth',
    image: '',
  })
}
