"use client";
import React, { useState, useCallback, useMemo } from "react";

import { l2Registry } from "@/lib/l2-registry";
import { Button, Input, Typography } from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { usePonder, Name } from "@/hooks/usePonder";

export default function Home() {
  const [name, setName] = useState("");
  const { address } = useAccount();

  // Prepare contract write configuration
  const prepareConfig = useMemo(
    () => ({
      ...l2Registry,
      functionName: "register",
      args: address ? [name, address, address, ""] : undefined,
    }),
    [name, address]
  );

  const prepare = usePrepareContractWrite(prepareConfig);
  const tx = useContractWrite(prepare.config);
  const receipt = useWaitForTransaction(tx.data); // Define receipt here

  const handleMintClick = useCallback(() => {
    if (tx.write) {
      tx.write();
    }
  }, [tx.write]);

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...l2Registry,
        functionName: "getEthAddressByName",
        args: [name],
      },
      {
        ...l2Registry,
        functionName: "totalSupply",
      },
    ],
  });

  const ponder = usePonder();

  const handleInputChange = (e: any) => {
    setName(e.target.value);
  };

  const totalSupply =
    data && data[1] ? Number(data[1].result).toString() : "Unavailable";
  console.log({ data });
  console.log({ name });
  console.log({ totalSupply });

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
          Team Nick's Mint Count: {isLoading ? "1" : totalSupply}
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
        <Button
          disabled={!address || !name}
          onClick={handleMintClick}
          width="45"
        >
          Mint
        </Button>
      </div>
      <div className="text-center">
        {(() => {
          if (receipt.isSuccess) {
            return <p>success! {name}.teamnick.eth is live!</p>;
          }

          if (receipt.isError) {
            return <p>failed!</p>;
          }

          if (receipt.isLoading) {
            return <p>processing...</p>;
          }

          return <p>Names don't mint themselves. Clickety click.</p>;
        })()}
      </div>
      <div className="py-10">
        <SubNameTable names={ponder.data?.data.names} />
      </div>
    </main>
  );
}

export function SubNameTable({ names }: { names: Name[] | undefined }) {
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
                  index % 2 === 0 ? "bg-gray-50" : ""
                } border-b border-gray-200`}
              >
                <td className="flex pl-3 py-4">
                  {name.name}
                  <div className="opacity-50">.teamnick.eth</div>
                </td>
                <td className="text-right pr-4 py-2 ">
                  {formatAddress(name.ethAddress)}
                </td>
                <td className="text-right pr-4 py-2">
                  {formatAddress(name.owner)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatAddress(address) {
  if (!address || address.length < 10) {
    return address; // Or handle the error as per your application's needs
  }
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
