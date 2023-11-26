import { Address, Client, parseAbi } from 'viem'
import { readContract } from 'viem/actions'

type PromiseOrResult<T> = T | Promise<T>

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'
const TTL = 1000

const l2Registry = {
  address: '0xf604051a9db102b4f8fb2e8feb12594d87afe3cc' as Address,
  abi: parseAbi([
    'function addrByName(string calldata name) public view returns (address)',
    'function avatarByName(string calldata name) public view returns (string memory)',
  ]),
}

export interface Database {
  addr(
    name: string,
    coinType: number,
    client: Client
  ): PromiseOrResult<{ addr: string; ttl: number }>
  text(
    name: string,
    key: string,
    client: Client
  ): PromiseOrResult<{ value: string; ttl: number }>
  contenthash(
    name: string
  ): PromiseOrResult<{ contenthash: string; ttl: number }>
}

export interface DatabaseResult {
  result: any[]
  ttl: number
}

// TODO: get data from L2 contract
export const database: Database = {
  async addr(name, coinType, client) {
    try {
      let address = ZERO_ADDRESS

      // only handle ETH for now
      if (coinType === 60) {
        address = await readContract(client, {
          ...l2Registry,
          functionName: 'addrByName',
          args: [name],
        })
      }

      return { addr: address, ttl: TTL }
    } catch (error) {
      console.error('Error resolving addr', error)
      return { addr: '', ttl: TTL }
    }
  },
  async contenthash() {
    const contenthash = EMPTY_CONTENT_HASH
    return { contenthash, ttl: TTL }
  },
  async text(name, key, client) {
    try {
      let value = ''

      // only handle avatar for now
      if (key === 'avatar') {
        value = await readContract(client, {
          ...l2Registry,
          functionName: 'avatarByName',
          args: [name],
        })
      }

      return { value, ttl: TTL }
    } catch (error) {
      console.error('Error resolving text', error)
      return { value: '', ttl: TTL }
    }
  },
}
