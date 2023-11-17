import hre from 'hardhat'

async function main() {
  const contractName = 'OffchainResolver'
  const args = [
    'https://teamnick-gateway.gregskril.workers.dev/lookup/{sender}/{data}.json', // _url (cloudflare worker)
    [
      '0xd55f4c2634D9E384C4EaD770C7DbBAe02Ef45e88',
      '0x179A862703a4adfb29896552DF9e307980D19285',
      '0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF',
    ], // _signers
  ]

  const contract = await hre.viem.deployContract(contractName, args)

  console.log(`${contractName} deployed to ${contract.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
