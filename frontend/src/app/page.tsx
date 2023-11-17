"use client";
import React, { useState, useEffect } from "react";

import { l2Registry } from "@/lib/l2-registry";
import { Button, Input, Typography } from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { createPublicClient, http } from "viem";
import { localhost, mainnet } from "viem/chains";

export default function Home() {
  const [name, setName] = useState("");
  const [token, setToken] = useState(null);
  const { address } = useAccount();

  const prepare = usePrepareContractWrite({
    ...l2Registry,
    functionName: "register",
    args: address
      ? [
          name, // name
          address, // owner
          address, // ethAddress
          "", // avatar
        ]
      : undefined,
  });

  const tx = useContractWrite(prepare.config);
  const receipt = useWaitForTransaction(tx.data);

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

  const { data: totalSupplyData } = useContractRead({
    ...l2Registry,
    functionName: "totalSupply",
  });

  // const [tokenIds, setTokenIds] = useState([]);

  useEffect(() => {
    fetchTokens().then((fetchedToken) => {
      // Check if fetchedToken is defined
      if (typeof fetchedToken !== "undefined") {
        // Convert the fetchedToken to a string
        const tokenString = fetchedToken.toString();
        setToken(tokenString);
      } else {
        // Handle the case where fetchedToken is undefined
        // You can set a default value or take appropriate action
        console.log(fetchedToken, "error");
      }
    });
  }, []);

  const handleInputChange = (e) => {
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
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
      <div className="flex flex-col pb-12 pt-2">
        <Typography
          fontVariant="extraLarge"
          className="text-center text-gray-600 pb-3"
        >
          Team Nick's Mint Count: {isLoading ? "1" : totalSupply}
          {/*  -- {token} */}
        </Typography>
        <Typography
          fontVariant="base"
          className=" text-center text-gray-600 max-w-12"
        >
          Register a free ENS Subname on Base. Works on mainnet!
        </Typography>
      </div>

      <div className="max-w-sm pb-4 w-1/2 mx-auto">
        <Input
          className="input-width"
          label="Choose a name"
          placeholder="go"
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
            return <p>success! {name}.teamnick.eth is live!</p>;
          }

          if (receipt.isError) {
            return <p>failed!</p>;
          }

          if (receipt.isLoading) {
            return <p>processing...</p>;
          }

          return <p>do something dude</p>;
        })()}
      </div>
      {/* <SubNameTable /> */}
    </main>
  );
}

export function SubNameTable(props) {
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const emptyRows = Array(itemsPerPage - 5).fill(null);

  return (
    <>
      <div className="max-w-5xl grow my-0 mx-auto bg-white rounded-none rounded-r-lg rounded-b-lg rounded-l-lg p-5 relative min-w-[480px] ">
        <table className="w-full min-w-[480px] pb-4">
          <caption className="text-lg">Subnames</caption>
          <thead>
            <tr>
              <th className="text-center px-2">Name</th>
              <th className="text-left pl-2">Eth Address</th>
            </tr>
          </thead>
          <tbody>{/* ... your map function and emptyRows */}</tbody>
        </table>
      </div>
    </>
  );
}

async function fetchTokens() {
  const client = createPublicClient({
    chain: localhost,
    transport: http(),
  });

  const token = await client.readContract({
    ...l2Registry,
    functionName: "tokenByIndex",
    args: [1],
  });
  return token;

  //tokenOfOwnerByIndex

  // try {
  //   const blockNumber = await client.getBlockNumber();
  //   console.log(blockNumber, "hi");
  //   return blockNumber;
  // } catch (error) {
  //   console.error("There was a problem with the fetch operation:", error);
  //   // Handle the error appropriately
  //   return null;
  // }
}
