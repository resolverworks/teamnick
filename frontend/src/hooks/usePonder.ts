import { Profile, PonderResponse, ponderUrl } from '@/lib/ponder'
import { useState } from 'react'
import { useFetch } from 'usehooks-ts'

// Key is used to trigger a re-fetch
export function usePonder() {
  const [cacheKey, setCacheKey] = useState('')

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
    ponderUrl + '?key=' + cacheKey,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphQlQuery }),
    }
  )

  function refetch() {
    setCacheKey(Date.now().toString())
  }

  return {
    profiles: data?.data?.profiles,
    error,
    isLoading: !data && !error,
    refetch,
  }
}
