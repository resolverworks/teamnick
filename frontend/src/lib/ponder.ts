export type PonderResponse<T> = {
  data: T
  errors: {
    message: string
    locations: any[]
  }[]
}

export type Name = {
  id: string
  name: string
  owner: string
  avatar: string
  ethAddress: string
}

export async function getNameByTokenId(id: string) {
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

  return name
}
