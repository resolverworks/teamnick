import { useFetch } from 'usehooks-ts'

export type Name = {
  id: string
  name: string
  owner: string
  avatar: string
  ethAddress: string
}

export function usePonder() {
  const graphQlQuery = `
    query {
      names {
        id
        name
        owner
        ethAddress
        avatar
      }
    }
  `

  return useFetch<{ data: { names: Name[] } }>(
    'https://teamnick.up.railway.app/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphQlQuery }),
    }
  )
}
