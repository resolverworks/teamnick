'use client'

import { l2Registry } from '@/lib/l2-registry'
import { Button } from '@ensdomains/thorin'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export default function Home() {
  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'register',
    args: [
      '', // name
      '', // owner
      '', // ethAddress
      '', // avatar
    ],
  })

  const tx = useContractWrite(prepare.config)
  const receipt = useWaitForTransaction(tx.data)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Mint</Button>
    </main>
  )
}
