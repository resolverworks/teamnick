'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { encodePacked, keccak256 } from 'viem'
import {
  useAccount,
  useBlockNumber,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { useDebounce } from 'usehooks-ts'
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
import React, { useState, useEffect } from 'react'

import { l2Registry } from '@/lib/l2-registry'
import { Profile } from '@/lib/ponder'
import { usePonder } from '@/hooks/usePonder'

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
  const errorMessage = debouncedName ? validateInput(debouncedName) : ''
  const [ponderCacheKey, setPonderCacheKey] = useState<string | undefined>()

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
  }, [receipt])

  const { data: supply, refetch: refetchSupply } = useContractRead({
    ...l2Registry,
    functionName: 'totalSupply',
  })

  const totalSupply = supply ? Number(supply).toString() : 'Unavailable'

  const ponder = usePonder({
    key: ponderCacheKey,
  })

  useEffect(() => {
    if (receipt.isSuccess) {
      // wait 1 second for ponder to index the transaction
      setTimeout(() => {
        refetchSupply()
        setPonderCacheKey(receipt?.data?.transactionHash)
      }, 1000)
    }
  }, [receipt.isSuccess])

  return (
    <main className="flex min-h-screen flex-col  max-w-3xl w-full mx-auto">
      <div className="flex py-10  justify-end">
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
      <div className="flex flex-col pb-12 pt-2">
        <Typography
          fontVariant="extraLargeBold"
          className="text-center text-gray-600 pb-3"
        >
          Team Nick's Mint Count: {totalSupply}
        </Typography>
        <Typography className=" text-center text-gray-600 max-w-12">
          Register a free ENS Subname on Base. Works on mainnet!
        </Typography>
      </div>

      <div className="max-w-sm pb-4 w-1/2 mx-auto">
        <Input
          className="input-width"
          label="Choose a name"
          placeholder="thebest"
          suffix=".teamnick.eth"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div
          className={`text-red-300 text-center ${
            errorMessage ? 'visible' : 'invisible'
          }`}
        >
          {errorMessage || 'Placeholder'}
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
      {/* <div className="max-w-xl  mx-auto">
        <UpdateRecords names={ponder.data?.data.names} />
      </div> */}
    </main>
  )
}

function SubNameTable({ names }: { names: Profile[] | undefined }) {
  return (
    <>
      <div className="max-w-xl grow my-0 mx-auto bg-white rounded-lg p-5 relative min-w-[480px]">
        <div className="text-lg mb-4 text-center font-semibold">
          Subnames Minted So Far
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
            {names?.map((name, index) => (
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

  const formattedAddress = `${address.substring(0, 6)}...${address.substring(
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
      {formattedAddress}
    </a>
  )
}

function hashLabel(label: string) {
  return BigInt(keccak256(encodePacked(['string'], [label])))
}

// export function UpdateRecords({ names }: { names: Name[] | undefined }) {
//   const { address } = useAccount();
//   const [selectOptions, setSelectOptions] = useState([]);
//   const [fullDataMapping, setFullDataMapping] = useState({});
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [isValid, setIsValid] = useState(false);
//   const [ownerAddress, setOwnerAddress] = useState("");
//   const [ethAddress, setEthAddress] = useState("");
//   const [selectedName, setSelectedName] = useState("");

//   // const [avatar,setAvatar] = useState("");
//   const [node, setNode] = useState("");
//   const isValidEthAddress = (address: string) => {
//     return /^0x[a-fA-F0-9]{40}$/.test(address);
//   };

//   // const { data, isError, isLoading } = useContractReads({
//   //   contracts: [
//   //     {
//   //       ...l2Registry,
//   //       functionName: "getEthAddressByName",
//   //       args: [name],
//   //     },
//   //     {
//   //       ...l2Registry,
//   //       functionName: "totalSupply",
//   //     },
//   //   ],
//   // });

//   useEffect(() => {
//     if (Array.isArray(names.names)) {
//       const newOptions = [];
//       const newMapping = {};

//       names.names
//         .filter((item) => item.owner === address)
//         .forEach((item, index) => {
//           const value = String(index); // Unique identifier for the option
//           newOptions.push({
//             value: value,
//             label: item.name + ".teamnick.eth",
//           });
//           newMapping[value] = item; // Store the full item data in the mapping
//         });

//       setSelectOptions(newOptions);
//       setFullDataMapping(newMapping); // Set the full data mapping
//     }
//   }, [names, address]);

//   const handleSelection = (event) => {
//     const selectedValue = event.target.value;
//     const fullData = fullDataMapping[selectedValue];
//     setSelectedOption(fullData); // Set the selected option's full data
//   };

//   useEffect(() => {
//     const isOwnerValid = ownerAddress === "" || isValidEthAddress(ownerAddress);
//     const isEthAddressValid =
//       ethAddress === "" || isValidEthAddress(ethAddress);
//     setIsValid(isOwnerValid && isEthAddressValid);
//   }, [ownerAddress, ethAddress]);

//   // const prepareConfig = useMemo(
//   //   () => ({
//   //     ...l2Registry,
//   //     functionName: "updateRecords",
//   //     args: address
//   //       ? [
//   //           node,
//   //           ownerAddress,
//   //           avatar,
//   //         ]
//   //       : undefined,
//   //   }),
//   //   [name, address]
//   // );

//   // const prepare = usePrepareContractWrite(prepareConfig);
//   // const tx = useContractWrite(prepare.config);
//   // const receipt = useWaitForTransaction(tx.data);

//   useEffect(() => {
//     if (selectedOption) {
//       setSelectedName(selectedOption.name);
//       console.log(hashLabel(selectedName));
//     }
//   }, [selectedOption]);

//   return (
//     <div className=" min-w-[480px]">
//       <Card>
//         <Select
//           autocomplete
//           options={selectOptions}
//           placeholder="Select an option..."
//           tabIndex="2"
//           onChange={handleSelection}
//         />
//         {selectedOption && (
//           <>
//             <RecordItem keyLabel="Owner" value={selectedOption.owner}>
//               {selectedOption.owner}
//             </RecordItem>
//             <RecordItem
//               keyLabel="Eth Address"
//               value={selectedOption.ethAddress}
//             >
//               {selectedOption.ethAddress}
//             </RecordItem>
//             <RecordItem keyLabel="Avatar" value={selectedOption.avatar}>
//               {selectedOption.avatar}
//             </RecordItem>
//           </>
//         )}
//       </Card>
//       {selectedOption && selectedOption.avatar && (
//         <div className=" max-w-[32px] ml-[44px] -mt-[60px] mb-[60px]">
//           <Avatar label="" src={selectedOption.avatar || ""} />
//         </div>
//       )}

//       <FieldSet legend="Update Records">
//         <Input
//           label="Owner"
//           placeholder="0x5423..."
//           value={ownerAddress}
//           onChange={(e) => setOwnerAddress(e.target.value)}
//         />
//         <Input
//           label="Eth Address"
//           placeholder="0x5423.."
//           value={ethAddress}
//           onChange={(e) => setEthAddress(e.target.value)}
//         />
//         <Input label="Avatar" placeholder="https://" />
//         <div className="pb-4  mx-auto">
//           <Button
//             // onClick=
//             width="45"
//             disabled={!isValid} // Disable button based on validity
//           >
//             Update Records
//           </Button>
//         </div>
//       </FieldSet>
//     </div>
//   );
// }
