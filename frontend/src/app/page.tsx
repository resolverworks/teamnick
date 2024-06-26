'use client'

import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { normalize } from 'viem/ens'
import { useDebounce } from 'usehooks-ts'
import { Button, Input, Typography, Skeleton } from '@ensdomains/thorin'
import React, { useState, useEffect, useRef } from 'react'

import { l2Registry } from '@/lib/l2-registry'
import NavBar from './components/NavBar'
import { register } from 'module'
import { set } from 'lodash'

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
  const [page, setPage] = useState(1)
  const [nameList, setNameList] = useState([])

  const { data: isAvailable } = useContractRead({
    ...l2Registry,
    functionName: 'available',
    args: [debouncedName],
  })

  const { config, isError } = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'register',
    enabled: validateInput(debouncedName) === '' && isAvailable,
    args: address
      ? [
          debouncedName,
          address,
          address,
          'https://cdn.pixabay.com/photo/2012/05/04/10/17/sun-47083_1280.png',
        ]
      : undefined,
  })

  const errorMessage = !isAvailable
    ? 'Name Exists'
    : debouncedName
      ? validateInput(debouncedName)
      : ''

  const tx = useContractWrite(config)
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
  const nameCount = supply ? parseInt(supply.toString()) : 0

  useEffect(() => {
    if (receipt.isSuccess) {
      setNameList((nameList) => {
        return [
          {
            name: recentName,
            address: address,
            owner: address,
            registeredAt: Math.floor(Date.now() / 1000).toString(),
          },
          ...nameList,
        ] as any
      })
      setTimeout(() => {
        refetchSupply()
        setPage(1)
      }, 20000)
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
          Register a free Trusted ENS Subname on Base. Tradable on{' '}
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
            normalizationError || isError ? 'visible' : 'invisible'
          }`}
        >
          {normalizationError || errorMessage || 'Placeholder'}
        </div>
      </div>
      <div className="pb-4  mx-auto">
        <Button
          disabled={
            !address || !name || !!errorMessage || !tx.write || !!isError
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
              <p className="text-center text-gray-400 text-base">
                Minted! Name will be ready for use in approx 5 hours.
              </p>
            )
          }

          if (receipt.isError) {
            return <p>failed!</p>
          }

          if (receipt.isLoading) {
            return <p>processing...</p>
          }

          return (
            <p className="text-center text-gray-400 text-base">
              There is a 5 hour delay until names are confimed on mainnet.
            </p>
          )
        })()}
      </div>
      <div className="py-10">
        <SubNameTable
          nameCount={nameCount}
          page={page}
          nameList={nameList}
          setNameList={setNameList}
        />
      </div>
    </main>
  )
}

function SubNameTable({
  nameCount,
  page,
  nameList,
  setNameList,
}: {
  nameCount: number
  page: number
  nameList: any[]
  setNameList: any
}) {
  const namesPerPage = 25
  const [currentPage, setCurrentPage] = useState(page)
  const fetchingRef = useRef(false)

  useEffect(() => {
    async function fetchUserRecords() {
      console.log('fetching')
      fetchingRef.current = true
      const nameJson = await fetch(
        'https://namestone.xyz/api/public_v1/get-onchain-names?domain=teamnick.eth',
        { method: 'GET' }
      )
      let names = []
      if (nameJson.status === 200) names = await nameJson.json()
      return names
    }

    if (nameList.length === 0 && !fetchingRef.current) {
      fetchUserRecords().then((data) => {
        fetchingRef.current = false
        console.log('fetch complete')
        setNameList(data)
      })
    }
  }, [nameList])

  const totalPages = Math.ceil(nameCount / namesPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const currentNames =
    nameList.length === 0
      ? Array.from({ length: namesPerPage }, (_, index) => ({
          id: `dummy-${index}`,
          name: `Dummy Name ${index + 1}`,
          label: `Dummy Label ${index + 1}`,
          address: '0x0000000000000000000000000000000000000000',
          owner: '0x0000000000000000000000000000000000000000',
          registeredAt: '0',
        }))
      : nameList.slice(
          (currentPage - 1) * namesPerPage,
          currentPage * namesPerPage
        )

  const loading = nameList.length === 0

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
              <th className="text-right pl-2 pr-4 py-2 opacity-60">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentNames?.map((name, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : ''
                } border-b border-gray-200`}
              >
                <td className="flex pl-3 py-4">
                  {loading ? (
                    <Skeleton loading={true}>123456789</Skeleton>
                  ) : (
                    <a
                      href={`https://app.ens.domains/${name.name}.teamnick.eth`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" hover:text-blue-800 "
                    >
                      {name.name}
                      <span className="opacity-50">.teamnick.eth</span>
                    </a>
                  )}
                </td>
                <td className="text-right pr-4 py-2 ">
                  {loading ? (
                    <Skeleton loading={true}>123456789</Skeleton>
                  ) : (
                    <FormattedAddressLink
                      address={name.address}
                      explorerUrl="https://basescan.org/address"
                    />
                  )}
                </td>
                <td className="text-right pr-4 py-2">
                  {loading ? (
                    <Skeleton loading={true}>123456789</Skeleton>
                  ) : (
                    <FormattedAddressLink
                      address={name.owner}
                      explorerUrl="https://basescan.org/address"
                    />
                  )}
                </td>
                <td className="text-right pr-4 py-2">
                  {loading ? (
                    <Skeleton loading={true}>123456789</Skeleton>
                  ) : (
                    <CountdownTimer registeredAt={name.registeredAt} />
                  )}{' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          {/* First Page */}
          {currentPage > 1 && (
            <button
              onClick={() => paginate(1)}
              className="mx-1 px-3 py-1 border rounded bg-white"
            >
              1
            </button>
          )}

          {/* Ellipsis for Previous Pages */}
          {currentPage > 3 && <span className="mx-1 px-3 py-1">...</span>}

          {/* Previous Page */}
          {currentPage > 2 && (
            <button
              onClick={() => paginate(currentPage - 1)}
              className="mx-1 px-3 py-1 border rounded bg-white"
            >
              {currentPage - 1}
            </button>
          )}

          {/* Current Page */}
          <button className="mx-1 px-3 py-1 border rounded bg-blue-500 text-white">
            {currentPage}
          </button>

          {/* Next Page */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => paginate(currentPage + 1)}
              className="mx-1 px-3 py-1 border rounded bg-white"
            >
              {currentPage + 1}
            </button>
          )}

          {/* Ellipsis for Next Pages */}
          {currentPage < totalPages - 2 && (
            <span className="mx-1 px-3 py-1">...</span>
          )}

          {/* Last Page */}
          {currentPage < totalPages && (
            <button
              onClick={() => paginate(totalPages)}
              className="mx-1 px-3 py-1 border rounded bg-white"
            >
              {totalPages}
            </button>
          )}
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

function CountdownTimer({ registeredAt = '0' }) {
  const [countdown, setCountdown] = useState('')
  const fiveHours = 5 * 60 * 60 * 1000 // 5 hours in milliseconds

  useEffect(() => {
    const registrationTime = parseInt(registeredAt, 10) * 1000 // Convert Unix timestamp string to milliseconds
    const intervalId = setInterval(() => {
      const currentTime = Date.now() // Current time in milliseconds
      const timeDifference = currentTime - registrationTime

      if (timeDifference >= fiveHours) {
        clearInterval(intervalId) // Stop the interval
        setCountdown('ready')
      } else {
        const countdownTime = fiveHours - timeDifference
        const hours = Math.floor(countdownTime / (60 * 60 * 1000))
        const minutes = Math.floor(
          (countdownTime % (60 * 60 * 1000)) / (60 * 1000)
        )
        const seconds = Math.floor((countdownTime % (60 * 1000)) / 1000)

        // Format the countdown as H:MM:SS
        setCountdown(`${hours}:${padZero(minutes)}:${padZero(seconds)}`)
      }
    }, 1000)

    return () => clearInterval(intervalId) // Clean up interval on component unmount
  }, [registeredAt])

  function padZero(num = 0) {
    return num < 10 ? '0' + num : num
  }

  return (
    <div>
      {countdown === 'ready' ? (
        <div className="w-[70px] h-[27px] px-[13px] py-1 bg-[#F1FAED] rounded-[17px] justify-center items-center gap-[5px] inline-flex">
          <div className="text-lime-500 text-base font-normal">Ready</div>
        </div>
      ) : (
        <div className="w-[69px] h-[27px] px-2 py-1 bg-[#EFF6FE] rounded-[17px] border justify-center items-center gap-[5px] inline-flex">
          <div className="text-blue-400 text-base font-normal">{countdown}</div>
        </div>
      )}
    </div>
  )
}
