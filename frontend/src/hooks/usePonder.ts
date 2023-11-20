import { Name, PonderResponse } from '@/lib/ponder'
import { useFetch } from 'usehooks-ts'

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

  return useFetch<PonderResponse<{ names: Name[] }>>(
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
