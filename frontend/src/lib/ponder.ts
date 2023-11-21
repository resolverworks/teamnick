export type PonderResponse<T> = {
  data: T
  errors: {
    message: string
    locations: any[]
  }[]
}

export type Profile = {
  id: string
  name: string
  label: string
  owner: string
  avatar: string
  address: string
  registeredAt: string
}

export const ponderUrl = 'https://teamnick.up.railway.app/'

export async function getNameByTokenId(id: string) {
  const res = await fetch(ponderUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        {
          profile (id: "${id}") {
            id
            name
            label
            owner
            avatar
            address
            registeredAt
          }
        }
      `,
    }),
  })

  const { data } = (await res.json()) as PonderResponse<{ profile: Profile }>
  const { profile } = data

  return profile
}
