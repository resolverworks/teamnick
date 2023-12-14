'use client'

import { encodePacked, keccak256 } from 'viem'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { normalize } from 'viem/ens'
import { useDebounce } from 'usehooks-ts'
import { Button, Input, Typography } from '@ensdomains/thorin'
import React, { useState, useEffect } from 'react'

import { l2Registry } from '@/lib/l2-registry'
import { Profile } from '@/lib/ponder'
import { usePonder } from '@/hooks/usePonder'
import NavBar from './components/NavBar'

const validateInput = (input: string) => {
  if (input.length < 2 || input.length > 10) {
    return 'Name must be between 2 and 10 characters.'
  }

  if (!/^[\x00-\x7F]+$/.test(input)) {
    return 'Name must contain only ASCII characters.'
  }

  return ''
}

export default function Home() {
  const { address } = useAccount()
  const [name, setName] = useState('')
  const debouncedName = useDebounce(name, 500)
  const [recentName, setRecentName] = useState('')
  const [normalizationError, setNormalizationError] = useState('')

  const ponder = usePonder()
  const isDupe = ponder.profiles?.some((profile) => profile.label === name)
  const errorMessage = isDupe
    ? 'Name Exists'
    : debouncedName
      ? validateInput(debouncedName)
      : ''

  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'register',
    enabled: validateInput(debouncedName) === '',
    args: address
      ? [
          debouncedName,
          address,
          address,
          'https://cdn.pixabay.com/photo/2012/05/04/10/17/sun-47083_1280.png',
        ]
      : undefined,
  })

  const tx = useContractWrite(prepare.config)
  const receipt = useWaitForTransaction(tx.data) // Define receipt here

  useEffect(() => {
    if (receipt.isSuccess || receipt.isError) {
      setName('') // Clear the input field when transaction is completed
    }
  }, [receipt.isSuccess, receipt.isError])

  const { data: supply, refetch: refetchSupply } = useContractRead({
    ...l2Registry,
    functionName: 'totalSupply',
  })

  const totalSupply = supply ? Number(supply).toString() : 'Unavailable'

  useEffect(() => {
    if (receipt.isSuccess) {
      // wait 1 second for ponder to index the transaction
      setTimeout(() => {
        refetchSupply()
        ponder.refetch()
      }, 1000)
    }
  }, [receipt.isSuccess])

  return (
    <main className="flex min-h-screen flex-col  max-w-3xl w-full mx-auto px-1">
      <NavBar />
      <div className="flex flex-col pb-12 pt-2">
        <Typography
          fontVariant="extraLargeBold"
          className="text-center text-gray-600 pb-3"
        >
          Team Nick's Mint Count: {totalSupply}
        </Typography>
        <Typography className="text-center text-gray-400 max-w-12">
          Register a free ENS Subname on Base. Tradable on{' '}
          <a
            href="https://opensea.io/collection/teamnick"
            className="underline hover:text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenSea
          </a>
          !
        </Typography>
      </div>

      <div className="max-w-sm pb-4 w-full sm:w-1/2 mx-auto">
        <Input
          className="input-width"
          label="Choose a name"
          placeholder="thebest"
          suffix=".teamnick.eth"
          value={name}
          onChange={(e) => {
            try {
              const normalizedValue = normalize(e.target.value)
              setName(normalizedValue)
              setNormalizationError('') // Clear any previous error
            } catch (error) {
              console.error('Normalization failed:', error)
              setNormalizationError(
                'Normalization failed. Please try a different name.'
              )
            }
          }}
        />
        <div
          className={`text-red-300 text-center pt-1 ${
            errorMessage || normalizationError ? 'visible' : 'invisible'
          }`}
        >
          {normalizationError || errorMessage || 'Placeholder'}
        </div>
      </div>
      <div className="pb-4  mx-auto">
        <Button
          disabled={
            !address ||
            !name ||
            !!errorMessage ||
            !tx.write ||
            !!prepare.isError
          }
          onClick={() => {
            setRecentName(name)
            tx.write?.()
          }}
          width="45"
        >
          Mint
        </Button>
      </div>
      <div className="text-center">
        {(() => {
          if (receipt.isSuccess) {
            return (
              <p>
                {'success! '}
                <a
                  href={`https://app.ens.domains/${recentName}.teamnick.eth`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" hover:text-blue-800 font-bold "
                >
                  {recentName}
                  <span className=" font-normal">.teamnick.eth </span>
                </a>
                is live!
              </p>
            )
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
        <SubNameTable names={ponder.profiles} />
      </div>
    </main>
  )
}

function SubNameTable({ names }: { names: Profile[] | undefined }) {
  const namesPerPage = 25
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastName = currentPage * namesPerPage
  const indexOfFirstName = indexOfLastName - namesPerPage
  const currentNames = names?.slice(indexOfFirstName, indexOfLastName)

  const totalPages = names ? Math.ceil(names.length / namesPerPage) : 0

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <>
      <div className="max-w-xl grow my-0 mx-auto bg-white rounded-lg p-5 relative min-w-[360px]">
        <div className="text-lg mb-4 text-center font-semibold">
          Subnames Minted
        </div>
        <table className="w-full min-w-[360px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pl-3 py-2 opacity-60">Name</th>
              <th className="text-right pl-2 pr-4 py-2 opacity-60">
                Eth Address
              </th>
              <th className="text-right pl-2 pr-4 py-2 opacity-60">Owner</th>
            </tr>
          </thead>
          <tbody>
            {currentNames?.map((name, index) => (
              <tr
                key={name.id}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : ''
                } border-b border-gray-200`}
              >
                <td className="flex pl-3 py-4">
                  <a
                    href={`https://app.ens.domains/${name.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" hover:text-blue-800 "
                  >
                    {name.label}
                    <span className="opacity-50">.teamnick.eth</span>
                  </a>
                </td>
                <td className="text-right pr-4 py-2 ">
                  <FormattedAddressLink
                    address={name.address}
                    explorerUrl="https://basescan.org/address"
                  />
                </td>
                <td className="text-right pr-4 py-2">
                  <FormattedAddressLink
                    address={name.owner}
                    explorerUrl="https://basescan.org/address"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 border rounded ${
                currentPage === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const FormattedAddressLink = ({
  address,
  explorerUrl,
}: {
  address: string
  explorerUrl: string
}) => {
  if (!address || address.length < 10) {
    return <span>{address}</span>
  }

  const formattedAddress = `${address.substring(0, 4)}...${address.substring(
    address.length - 4
  )}`
  const fullUrl = `${explorerUrl}/${address}`

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-800 underline"
    >
      {formattedAddress.toLowerCase()}
    </a>
  )
}

function hashLabel(label: string) {
  return BigInt(keccak256(encodePacked(['string'], [label])))
}
