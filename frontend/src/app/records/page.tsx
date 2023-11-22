'use client'

import {
  Address,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import React, { useState, useEffect } from 'react'
import { usePonder } from '@/hooks/usePonder'
import {
  Avatar,
  Button,
  Input,
  Typography,
  Select,
  Card,
  RecordItem,
  Spinner,
} from '@ensdomains/thorin'
import { Profile } from '@/lib/ponder'
import NavBar from '../components/NavBar'
import { l2Registry } from '@/lib/l2-registry'

export default function Records() {
  return (
    <main className="flex min-h-screen flex-col  max-w-3xl w-full mx-auto px-1">
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
  const [ponderCacheKey, setPonderCacheKey] = useState<string | undefined>()
  const ponder = usePonder({
    key: ponderCacheKey,
  })
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

  useEffect(() => {
    const newRecords =
      ponder.profiles?.filter((profile) => profile.id === selectedName) || []
    setRecords(newRecords)
  }, [selectedName])

  return (
    <div className="w-full pt-4 max-w-xl  mx-auto  relative min-w-[360px]">
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
            <RecordItem keyLabel="Owner" value={records[0].owner}>
              {records[0].owner}
            </RecordItem>
            <RecordItem keyLabel="Eth Address" value={records[0].address}>
              {records[0].address}
            </RecordItem>
            <div className="flex flex-row">
              <div className=" max-w-[75px] min-w-[75px] mx-2 my-auto">
                <Avatar label="Noun 97" src={records[0].avatar} />
              </div>
              <div className="grow my-auto">
                <RecordItem keyLabel="Avatar" value={records[0].avatar}>
                  {records[0].avatar.substring(0, 30) + '...'}
                </RecordItem>
              </div>
            </div>
            {/* <RecordItem
              keyLabel="Registrion Time"
              value={records[0].registeredAt}
            >
              {records[0].registeredAt}
            </RecordItem> */}
            {/* <RecordItem keyLabel="node" value={records[0].id}>
              {records[0].id}
            </RecordItem> */}

            <UpdateRecords records={records} />
          </>
        )}
      </Card>
    </div>
  )
}

function UpdateRecords({ records }: { records: Profile[] | undefined }) {
  const { address } = useAccount()
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [isValidAvatar, setIsValidAvatar] = useState(false)
  const [ethAddress, setEthAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  const [AvatarMsg, setAvatarMsg] = useState('')
  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // const prepare = usePrepareContractWrite({
  //   ...l2Registry,
  //   functionName: 'updateRecords',
  //   enabled: isValid,
  //   args: records
  //     ? [BigInt(records[0].id), ethAddress as Address, avatar]
  //     : undefined,
  // })

  // const tx = useContractWrite(prepare.config)
  // const receipt = useWaitForTransaction(tx.data)

  const prepareSetAddr = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'setAddr',
    enabled: isValidAddress,
    args: records ? [BigInt(records[0].id), ethAddress as Address] : undefined,
  })

  const setAddrTx = useContractWrite(prepareSetAddr.config)
  const setAddrReceipt = useWaitForTransaction(setAddrTx.data)

  const prepareUpdateAvatar = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'updateAvatar',
    enabled: isValidAvatar,
    args: records ? [BigInt(records[0].id), avatar] : undefined,
  })

  const updateAvatarTx = useContractWrite(prepareUpdateAvatar.config)
  const updateAvatarReceipt = useWaitForTransaction(updateAvatarTx.data)

  useEffect(() => {
    if (isValidEthAddress(ethAddress)) {
      setIsValidAddress(true)
    } else {
      setIsValidAddress(false)
    }
  }, [ethAddress])

  useEffect(() => {
    if (/\.(jpg|jpeg|png)$/.test(avatar) && avatar !== '') {
      setIsValidAvatar(true)
      setAvatarMsg('')
    } else if (avatar === '') {
      setIsValidAvatar(false)
      setAvatarMsg('')
    } else {
      setAvatarMsg('Avatar must end in jpg, jpeg, or png')
      setIsValidAvatar(false)
    }
  }, [avatar])

  return (
    <div className="flex  flex-col min-w-[360px] gap-6">
      <Input
        label="Eth Address"
        placeholder="0x5423.."
        value={ethAddress}
        onChange={(e) => setEthAddress(e.target.value)}
      />
      <div className=" text-center">
        {setAddrReceipt.isSuccess && (
          <div>Eth address updated successfully!</div>
        )}
      </div>
      <div className="mx-auto">
        <Button
          onClick={() => setAddrTx.write?.()}
          width="45"
          disabled={!isValidAddress} // Disable button based on validity
        >
          Update Address
        </Button>
      </div>
      <Input
        label="Avatar"
        placeholder="https://"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />
      <div className="min-h-[20px] text-red-400 mx-auto">
        {' '}
        {AvatarMsg} {updateAvatarReceipt.isLoading && <Spinner />}
        {updateAvatarReceipt.isSuccess && 'Avatar updated successfully'}
      </div>
      <div className="pb-4  mx-auto">
        <Button
          onClick={() => updateAvatarTx.write?.()}
          width="45"
          disabled={!isValidAvatar} // Disable button based on validity
        >
          Update Avatar
        </Button>
      </div>
    </div>
  )
}
