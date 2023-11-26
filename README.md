## TeamNick (Foundry)

Install dependencies

forge install 

Test script is in test/TeamNick.t.sol

forge test -vvvv

Deploy script is in 
script/TeamNick.s.sol

export OWNER=0x000000000000000000000000000000000000007B
export BASEURI=http://google.com

forge script script/TeamNick.s.sol

[⠆] Compiling...
No files changed, compilation skipped
Script ran successfully.
Gas used: 1693206

== Logs ==
  Deployed to:  0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f



If deploying to mainnet you need to export RPC_URL and a privatekey

export RPC_URL=yourrpcpath
export PRIVKEY=yourprivkey

forge script script/TeamNick.s.sol --rpc-url $RPC_URL --private-key $PRIVKEY --broadcast -vv







## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
