'use client'

import { l2Registry } from '@/lib/l2-registry'
import { Button, Input } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export default function Home() {
  const { address } = useAccount()

  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'register',
    args: address
      ? [
          'greg', // name
          address, // owner
          address, // ethAddress
          '', // avatar
        ]
      : undefined,
  })

  const tx = useContractWrite(prepare.config)
  const receipt = useWaitForTransaction(tx.data)

  const { data } = useContractRead({
    ...l2Registry,
    functionName: 'getEthAddressByName',
    args: ['greg'],
  })

  console.log({ data })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectButton />

      {(() => {
        if (receipt.isSuccess) {
          return <p>success!</p>
        }

        if (receipt.isError) {
          return <p>failed!</p>
        }

        if (receipt.isLoading) {
          return <p>processing...</p>
        }

        return <p>do something dude</p>
      })()}

      {/* <Input /> */}
      <Button disabled={!tx.write} onClick={() => tx.write?.()}>
        Mint
      </Button>
    </main>
  )
}
