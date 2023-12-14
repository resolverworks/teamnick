import { Profile, PonderResponse, ponderUrl } from '@/lib/ponder'
import { useState } from 'react'
import { useFetch } from 'usehooks-ts'

// Key is used to trigger a re-fetch
export function usePonder() {
  const [cacheKey, setCacheKey] = useState('')

  const graphQlQuery = `
  query ProfilesQuery($first: Int!) {
    profiles (orderBy: "registeredAt", orderDirection: "desc", first: $first) {
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

  const variables = {
    first: 1000, // set the value of 'first' here
  }

  const { data, error } = useFetch<PonderResponse<{ profiles: Profile[] }>>(
    ponderUrl + '?key=' + cacheKey,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: graphQlQuery,
        variables: variables, // include the variables in the request
      }),
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
