'use client'
import React, { useState } from 'react'

import { l2Registry } from '@/lib/l2-registry'
import { Button, Input, Typography } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { usePonder, Name } from '@/hooks/usePonder'

export default function Home() {
  const [name, setName] = useState('')
  const { address } = useAccount()

  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'register',
    args: address
      ? [
          name, // name
          address, // owner
          address, // ethAddress
          '', // avatar
        ]
      : undefined,
  })

  const tx = useContractWrite(prepare.config)
  const receipt = useWaitForTransaction(tx.data)

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...l2Registry,
        functionName: 'getEthAddressByName',
        args: [name],
      },
      {
        ...l2Registry,
        functionName: 'totalSupply',
      },
    ],
  })

  const ponder = usePonder()

  const handleInputChange = (e: any) => {
    setName(e.target.value)
  }

  const totalSupply =
    data && data[1] ? Number(data[1].result).toString() : 'Unavailable'
  console.log({ data })
  console.log({ name })
  console.log({ totalSupply })

  return (
    <main className="flex min-h-screen flex-col  max-w-3xl w-full mx-auto">
      <div className="flex py-10  justify-end">
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
      <div className="flex flex-col pb-12 pt-2">
        <Typography
          fontVariant="extraLarge"
          className="text-center text-gray-600 pb-3"
        >
          Team Nick's Mint Count: {isLoading ? '1' : totalSupply}
          {/*  -- {token} */}
        </Typography>
        <Typography className=" text-center text-gray-600 max-w-12">
          Register a free ENS Subname on Base. Works on mainnet!
        </Typography>
      </div>

      <div className="max-w-sm pb-4 w-1/2 mx-auto">
        <Input
          className="input-width"
          label="Choose a name"
          placeholder="thegoodone"
          suffix=".teamnick.eth"
          value={name}
          onChange={handleInputChange}
        />
      </div>
      <div className="pb-4  mx-auto">
        <Button disabled={!tx.write} onClick={() => tx.write?.()} width="45">
          Mint
        </Button>
      </div>
      <div className="text-center">
        {(() => {
          if (receipt.isSuccess) {
            return <p>success! {name}.teamnick.eth is live!</p>
          }

          if (receipt.isError) {
            return <p>failed!</p>
          }

          if (receipt.isLoading) {
            return <p>processing...</p>
          }

          return <p>Names don't mint themselves. Clickety click.</p>
        })()}
      </div>
      <div className="py-10">
        <SubNameTable names={ponder.data?.data.names} />
      </div>
    </main>
  )
}

export function SubNameTable({ names }: { names: Name[] | undefined }) {
  return (
    <>
      <div className="max-w-xl grow my-0 mx-auto bg-white rounded-none rounded-r-lg rounded-b-lg rounded-l-lg p-5 relative min-w-[480px] ">
        <table className="w-full min-w-[360px]  ">
          <caption className="text-lg pb-4">Subnames Minted So Far</caption>
          <thead>
            <tr>
              <th className="text-center px-2">Name</th>
              <th className="text-center pl-2">Eth Address</th>
            </tr>
          </thead>
          <tbody>
            {names?.map((name) => (
              <tr key={name.id}>
                <td className="pl-11">{name.name}</td>
                <td className="text-right pr-4">{name.ethAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
