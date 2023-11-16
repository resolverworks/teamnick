import hre from 'hardhat'

async function main() {
  const contractName = 'TeamNick'
  const args = [
    '0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF', // initialOwner
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
