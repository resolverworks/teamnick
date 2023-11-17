import type { Contract } from 'ethers'

type PromiseOrResult<T> = T | Promise<T>

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const EMPTY_CONTENT_HASH = '0x'
const TTL = 1000

export interface Database {
  addr(
    name: string,
    coinType: number,
    contract: Contract
  ): PromiseOrResult<{ addr: string; ttl: number }>
  text(
    name: string,
    key: string,
    contract: Contract
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
  async addr(name, coinType, contract) {
    try {
      let address

      // only handle ETH for now
      if (coinType === 60) {
        address = await contract.getEthAddressByName(name)
      }

      const addr = address || ZERO_ADDRESS
      return { addr, ttl: TTL }
    } catch (error) {
      console.error('Error resolving addr', error)
      return { addr: '', ttl: TTL }
    }
  },
  async contenthash(name) {
    const contenthash = EMPTY_CONTENT_HASH
    return { contenthash, ttl: TTL }
  },
  async text(name, key, contract) {
    try {
      let value = ''

      // only handle avatar for now
      if (key === 'avatar') {
        value = await contract.getAvatarByName(name)
      }

      return { value, ttl: TTL }
    } catch (error) {
      console.error('Error resolving text', error)
      return { value: '', ttl: TTL }
    }
  },
}
