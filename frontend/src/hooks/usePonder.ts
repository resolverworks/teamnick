import { Profile, PonderResponse, ponderUrl } from '@/lib/ponder'
import { useFetch } from 'usehooks-ts'

// Key is used to trigger a re-fetch
export function usePonder({ key }: { key?: string | undefined }) {
  const graphQlQuery = `
    query {
      profiles (orderBy: "registeredAt", orderDirection: "desc") {
        id
        name
        label
        owner
        address
        avatar
        registeredAt
      }
    }
  `

  const { data, error } = useFetch<PonderResponse<{ profiles: Profile[] }>>(
    ponderUrl + '?key=' + (key || ''),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphQlQuery }),
    }
  )

  return {
    profiles: data?.data?.profiles,
    error,
    isLoading: !data && !error,
  }
}
