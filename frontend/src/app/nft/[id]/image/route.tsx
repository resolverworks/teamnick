import { Profile } from '@/lib/ponder'
import { ImageResponse } from '@vercel/og'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export const runtime = 'edge'

const schema = z.object({
  id: z.string().regex(/^[0-9]+$/),
})

const PROD_URL = 'teamnick.xyz'
const baseUrl = process.env.VERCEL_URL
  ? `https://${PROD_URL}`
  : 'http://localhost:3000'

// Cache to store generated images
const imageCache = new Map<string, ImageResponse>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<ImageResponse | NextResponse> {
  const safeParse = schema.safeParse(params)

  if (!safeParse.success) {
    return NextResponse.json(safeParse.error, { status: 400 })
  }

  const { id } = safeParse.data

  // Check if the image is already cached
  if (imageCache.has(id)) {
    return imageCache.get(id) as ImageResponse
  }

  const queryParams = new URLSearchParams({
    'cache-bust': Date.now().toString(),
  })
  const nameJson = await fetch(
    `https://namestone.xyz/api/public_v1/get-name-by-token-id?domain=teamnick.eth&token_id=${id}&${queryParams.toString()}`,
    { method: 'GET' }
  )

  let profile = null
  if (nameJson.status === 200) profile = (await nameJson.json()) as any

  const image = await generateImage(profile)
  // Cache the generated image
  imageCache.set(id, image)
  return image
}

const fontBold = fetch(
  new URL('../../../../assets/Satoshi-Bold.otf', import.meta.url)
).then((res) => res.arrayBuffer())

async function generateImage(profile: Profile): Promise<ImageResponse> {
  const fontBoldData = await fontBold

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'Satoshi',
          width: '100%',
          height: '100%',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        <img
          style={{
            position: 'absolute',
            inset: '0',
          }}
          src={`${baseUrl}/gradient.svg`}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1,
            padding: '7rem',
            fontSize: '9rem',
            position: 'absolute',
            bottom: '0',
            width: '100%',
            textShadow: '2px 2px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span>{profile.name}.</span>

          <span
            style={{
              opacity: 0.5,
            }}
          >
            teamnick.eth
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        {
          name: 'Satoshi',
          data: fontBoldData,
          style: 'normal',
        },
      ],
    }
  )
}
