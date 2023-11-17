"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";

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

import { debounce } from "lodash";

import { usePonder, Name } from "@/hooks/usePonder";

export default function Home() {
  const [name, setName] = useState("");
  const [recentName, setRecentName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const validateInput = (input) => {
    if (input.length < 2 || input.length > 10) {
      return "Name must be between 2 and 10 characters.";
    }
    if (!/^[\x00-\x7F]+$/.test(input)) {
      return "Name must contain only ASCII characters.";
    }
    return "";
  };

  const validateInputDebounced = useCallback(
    debounce((value) => {
      setErrorMessage(validateInput(value));
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setName(value);
    validateInputDebounced(value);
  };

  useEffect(() => {
    return () => {
      validateInputDebounced.cancel();
    };
  }, [validateInputDebounced]);
  const { address } = useAccount();

  // Prepare contract write configuration
  const prepareConfig = useMemo(
    () => ({
      ...l2Registry,
      functionName: "register",
      args: address
        ? [
            name,
            address,
            address,
            "https://cdn.pixabay.com/photo/2012/05/04/10/17/sun-47083_1280.png",
          ]
        : undefined,
    }),
    [name, address]
  );

  const prepare = usePrepareContractWrite(prepareConfig);
  const tx = useContractWrite(prepare.config);
  const receipt = useWaitForTransaction(tx.data); // Define receipt here

  const handleMintClick = useCallback(() => {
    if (tx.write) {
      setRecentName(name);
      tx.write();
    }
  }, [tx.write]);

  useEffect(() => {
    if (receipt.isSuccess || receipt.isError) {
      setName(""); // Clear the input field when transaction is completed
    }
  }, [receipt]);

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
          placeholder="thebest"
          suffix=".teamnick.eth"
          value={name}
          onChange={handleInputChange}
        />
        <div
          className={`text-red-300 text-center ${
            errorMessage ? "visible" : "invisible"
          }`}
        >
          {errorMessage || "Placeholder"}
        </div>
      </div>
      <div className="pb-4  mx-auto">
        <Button
          disabled={!address || !name || errorMessage}
          onClick={handleMintClick}
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
                {"success! "}
                <a
                  href={`https://app.ens.domains/${name.name}.teamnick.eth`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" hover:text-blue-800 font-bold "
                >
                  {recentName}
                  <span className=" font-normal">.teamnick.eth </span>
                </a>
                is live!
              </p>
            );
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
                  <a
                    href={`https://app.ens.domains/${name.name}.teamnick.eth`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" hover:text-blue-800 "
                  >
                    {name.name}
                    <span className="opacity-50">.teamnick.eth</span>
                  </a>
                </td>
                <td className="text-right pr-4 py-2 ">
                  <FormattedAddressLink
                    address={name.ethAddress}
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
  );
}

const FormattedAddressLink = ({ address, explorerUrl }) => {
  if (!address || address.length < 10) {
    return <span>{address}</span>;
  }

  const formattedAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
  const fullUrl = `${explorerUrl}/${address}`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-800 underline"
    >
      {formattedAddress}
    </a>
  );
};
