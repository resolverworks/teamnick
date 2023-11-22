'use client'

import {
  Address,
  useAccount,
  useBlockNumber,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { useState, useEffect } from 'react'
import { usePonder } from '@/hooks/usePonder'
import {
  Avatar,
  Button,
  Input,
  Typography,
  FieldSet,
  Select,
  Card,
  RecordItem,
} from '@ensdomains/thorin'

import { Profile } from '@/lib/ponder'

import Link from 'next/link'
import NavBar from '../components/NavBar'

import { l2Registry } from '@/lib/l2-registry'

export default function Records() {
  return (
    <main className="flex min-h-screen flex-col  max-w-3xl w-full mx-auto">
      <NavBar />
      <div className="flex flex-col pb-12 pt-2">
        <Typography
          fontVariant="extraLargeBold"
          className="text-center text-gray-600 pb-3"
        >
          Subname Records
        </Typography>
        <Typography className=" text-center text-gray-600 max-w-12">
          View & Update Records
        </Typography>
        <DisplayRecords />
      </div>
    </main>
  )
}

function DisplayRecords() {
  const { address } = useAccount()
  const ponder = usePonder({})
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [records, setRecords] = useState<Profile[] | null>(null)

  const filteredNames =
    ponder.profiles
      ?.filter(
        (profile) => profile.owner.toLowerCase() === address?.toLowerCase()
      )
      .map((profile) => ({
        value: profile.id, // Assuming you want to use the profile ID as the value
        label: profile.name, // The name will be shown in the dropdown
      })) || []

  console.log(filteredNames)

  useEffect(() => {
    const newRecords =
      ponder.profiles?.filter((profile) => profile.id === selectedName) || []
    setRecords(newRecords)
  }, [selectedName])

  console.log(records)
  return (
    <div className="w-full pt-4 max-w-xl  mx-auto  relative min-w-[480px]">
      <Card>
        <Select
          label=""
          autocomplete
          options={filteredNames}
          placeholder="Select a Name"
          onChange={(event) => setSelectedName(event.target.value)}
        />
        {records && records.length > 0 && (
          <>
            <div>Current</div>
            <RecordItem keyLabel="Owner" value={records[0].owner}>
              {records[0].owner}
            </RecordItem>
            <RecordItem keyLabel="Eth Address" value={records[0].address}>
              {records[0].address}
            </RecordItem>
            <RecordItem keyLabel="Avatar" value={records[0].avatar}>
              {records[0].avatar}
            </RecordItem>
            {/* <RecordItem
              keyLabel="Registrion Time"
              value={records[0].registeredAt}
            >
              {records[0].registeredAt}
            </RecordItem> */}
            <RecordItem keyLabel="node" value={records[0].id}>
              {records[0].id}
            </RecordItem>
            <UpdateRecords records={records} />
          </>
        )}
      </Card>
    </div>
  )
}

function UpdateRecords({ records }: { records: Profile[] | undefined }) {
  const { address } = useAccount()
  const [isValid, setIsValid] = useState(false)
  const [ethAddress, setEthAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'updateRecords',
    enabled: isValid,
    args: records
      ? [BigInt(records[0].id), ethAddress as Address, avatar]
      : undefined,
  })

  const tx = useContractWrite(prepare.config)
  const receipt = useWaitForTransaction(tx.data)

  console.log('update', ethAddress, isValid)
  console.log(records)

  useEffect(() => {
    if (isValidEthAddress(ethAddress)) {
      setIsValid(true)
    }
  }, [ethAddress])

  return (
    <div className="flex  flex-col min-w-[480px] gap-6">
      <Input
        label="Eth Address"
        placeholder="0x5423.."
        value={ethAddress}
        onChange={(e) => setEthAddress(e.target.value)}
      />
      <Input label="Avatar" placeholder="https://" />
      <div className="pb-4  mx-auto">
        <Button
          // onClick=
          width="45"
          disabled={!isValid} // Disable button based on validity
        >
          Update Records
        </Button>
      </div>
    </div>
  )
}
