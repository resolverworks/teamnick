'use client'

import {
  Address,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import React, { useState, useEffect } from 'react'
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
import { NamestoneProfile } from '@/lib/ponder'
import NavBar from '../components/NavBar'
import { l2Registry } from '@/lib/l2-registry'
import { start } from 'repl'

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
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] =
    useState<NamestoneProfile | null>(null)
  const [nameList, setNameList] = useState<NamestoneProfile[]>([])

  async function fetchUserRecords() {
    const nameJson = await fetch(
      'https://namestone.xyz/api/public_v1/get-onchain-names?domain=teamnick.eth&addresses=' +
        address,
      { method: 'GET' }
    )
    let names: any = null
    if (nameJson.status === 200) names = await nameJson.json()
    if (names === null || names.length === 0 || !names) {
      return null
    }
    console.log(names)
    return names
  }

  useEffect(() => {
    fetchUserRecords().then((names) => {
      if (names) {
        setNameList(names)
      }
    })
  }, [address])

  const filteredNames =
    nameList
      ?.filter(
        (profile) => profile.owner.toLowerCase() === address?.toLowerCase()
      )
      .map((profile) => ({
        value: profile.tokenId, // Assuming you want to use the profile ID as the value
        label: profile.name, // The name will be shown in the dropdown
      })) || []

  useEffect(() => {
    console.log(nameList, selectedName)
    if (nameList && selectedName) {
      // prettier-ignore
      const filteredProfiles = nameList.filter((profile) => profile.tokenId === selectedName) || []

      setSelectedProfile(filteredProfiles[0])
    }
  }, [selectedName, nameList])

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
        {selectedProfile && (
          <>
            <RecordItem keyLabel="Owner" value={selectedProfile.owner}>
              {selectedProfile.owner}
            </RecordItem>
            <RecordItem keyLabel="Eth Address" value={selectedProfile.address}>
              {selectedProfile.address}
            </RecordItem>
            <div className="flex flex-row">
              <div className=" max-w-[75px] min-w-[75px] mx-2 my-auto">
                <Avatar
                  label="Noun 97"
                  src={selectedProfile.textRecords.avatar}
                />
              </div>
              <div className="grow my-auto">
                <RecordItem
                  keyLabel="Avatar"
                  value={selectedProfile.textRecords.avatar}
                >
                  {selectedProfile.textRecords.avatar.substring(0, 30) + '...'}
                </RecordItem>
              </div>
            </div>
            {/* <RecordItem
              keyLabel="Registrion Time"
              value={selectedProfile.registeredAt}
            >
              {selectedProfile.registeredAt}
            </RecordItem> */}
            {/* <RecordItem keyLabel="node" value={selectedProfile.id}>
              {selectedProfile.id}
            </RecordItem> */}

            <UpdateRecords
              selectedProfile={selectedProfile}
              refetchNames={fetchUserRecords}
            />
          </>
        )}
      </Card>
    </div>
  )
}

function UpdateRecords({
  selectedProfile,
  refetchNames,
}: {
  selectedProfile: NamestoneProfile | undefined
  refetchNames: () => void
}) {
  const { address } = useAccount()
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [isValidAvatar, setIsValidAvatar] = useState(false)
  const [ethAddress, setEthAddress] = useState('')
  const [avatar, setAvatar] = useState('')
  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const prepareSetAddr = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'setAddr',
    enabled: isValidAddress,
    args: selectedProfile
      ? [BigInt(selectedProfile.tokenId), ethAddress as Address]
      : undefined,
  })

  const setAddrTx = useContractWrite(prepareSetAddr.config)
  const setAddrReceipt = useWaitForTransaction(setAddrTx.data)

  const prepareUpdateAvatar = usePrepareContractWrite({
    ...l2Registry,
    functionName: 'updateAvatar',
    enabled: isValidAvatar,
    args: selectedProfile
      ? [BigInt(selectedProfile.tokenId), avatar]
      : undefined,
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
    if (avatar !== '') {
      setIsValidAvatar(true)
    } else if (avatar === '') {
      setIsValidAvatar(false)
    } else {
      setIsValidAvatar(false)
    }
  }, [avatar])

  useEffect(() => {
    if (updateAvatarReceipt.isSuccess || setAddrReceipt.isSuccess) {
      if (updateAvatarReceipt.isSuccess) {
        setAvatar('')
      } else if (setAddrReceipt.isSuccess) {
        setEthAddress('')
      }

      // wait 1 second for ponder to index the transaction
      setTimeout(() => {
        refetchNames()
      }, 1000)
    }
  }, [updateAvatarReceipt.isSuccess, setAddrReceipt.isSuccess])

  return (
    <div className="flex  flex-col min-w-[360px] gap-6">
      <Input
        label="Eth Address"
        placeholder="0x5423.."
        value={ethAddress}
        onChange={(e) => setEthAddress(e.target.value)}
      />
      <div className="min-h-[20px] mx-auto">
        {' '}
        {setAddrReceipt.isLoading && <Spinner />}
        {setAddrReceipt.isSuccess &&
          'Eth address updated successfully. Change will be in effect in approx 5 hours.'}
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
      <div className="min-h-[20px] mx-auto">
        {' '}
        {updateAvatarReceipt.isLoading && <Spinner />}
        {updateAvatarReceipt.isSuccess &&
          'Avatar updated successfully! Change will be in effect in approx 5 hours.'}
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
