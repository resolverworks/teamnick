import { Profile, PonderResponse, ponderUrl } from '@/lib/ponder'
import { useState } from 'react'
import { useFetch } from 'usehooks-ts'

// Key is used to trigger a re-fetch
export function usePonder(start: number = 0, owner?: string) {
  const [skip, setSkip] = useState(start)
  const [cacheKey, setCacheKey] = useState('')

  const graphQlQuery = `
  query ProfilesQuery($first: Int!, $skip: Int!, $owner: String) {
    profiles (orderBy: "registeredAt", orderDirection: "desc", first: $first, skip: $skip, where: {owner: $owner}) {
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
    first: 25, // set the value of 'first' here
    skip: start,
    owner: owner,
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
