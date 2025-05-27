import { ethers } from 'ethers'

export const RPC_URL = 'https://0g-testnet-rpc.astrostake.xyz'
export const provider = new ethers.JsonRpcProvider(RPC_URL)

export async function getLatestBlockNumber() {
  return await provider.getBlockNumber()
}

export async function getBlockByNumber(blockNumber: number) {
  return await provider.getBlock(blockNumber)
}

export async function getLatestBlocks(count: number = 10) {
  const latest = await provider.getBlockNumber()
  const blocks = await Promise.all(
    Array.from({ length: count }).map((_, i) => provider.getBlock(latest - i))
  )
  return blocks
}

export async function getTransactionWithReceipt(txHash: string) {
  const tx = await provider.getTransaction(txHash)
  const receipt = await provider.getTransactionReceipt(txHash)
  return { tx, receipt }
}

export async function getRecentTransactions(txCount: number = 10) {
  const latest = await provider.getBlockNumber()
  let transactions: any[] = []
  let blocksChecked = 0
  const maxBlocks = 100

  while (transactions.length < txCount && blocksChecked < maxBlocks) {
    const blockNumber = latest - blocksChecked
    const block = await provider.getBlock(blockNumber, true)

    if (block?.transactions?.length) {
      const validTxs = block.transactions.filter(
        (tx: any) => tx && typeof tx.hash === 'string' && typeof tx.from === 'string'
      )
      transactions = transactions.concat(validTxs)
    }

    blocksChecked++
  }

  return transactions.slice(0, txCount)
}

export async function getTxChartData(count: number = 10) {
  const latest = await provider.getBlockNumber()
  const blocks = await Promise.all(
    Array.from({ length: count }).map((_, i) =>
      provider.getBlock(latest - i)
    )
  )

  return blocks.reverse().map((block) => ({
    block: block?.number ?? 0,
    txs: block?.transactions?.length ?? 0,
    timestamp: block
      ? new Date(block.timestamp * 1000).toLocaleTimeString()
      : '',
  }))
}
export async function getAddressDetail(address: string) {
  const url = `https://chainscan-galileo.0g.ai/v1/account/${address}?fields=cfxTransferCount&fields=erc20TransferCount&fields=erc721TransferCount&fields=erc1155TransferCount&fields=stakingBalance`
  const res = await fetch(url)
  const json = await res.json()
  return json.result
}

export async function getAddressTransactions(address: string, limit = 10, skip = 0) {
  const url = `https://chainscan-galileo.0g.ai/v1/transaction?accountAddress=${address}&limit=${limit}&skip=${skip}&tab=transaction`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch address transactions')

    const json = await res.json()
    const list = json.result?.list || []
    const total = json.result?.total || 0

    return { list, total }
  } catch (err) {
    console.error('API error:', err)
    return { list: [], total: 0 }
  }
}

export async function getERC20Transfers(address: string, limit = 10, skip = 0) {
  const url = `https://chainscan-galileo.0g.ai/v1/transfer?accountAddress=${address}&limit=${limit}&skip=${skip}&tab=transfers-ERC20&transferType=ERC20`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch ERC20 transfers')

    const json = await res.json()
    const list = json.result?.list || []
    const total = json.result?.total || 0

    const parsed = list.map((tx: any) => ({
      hash: tx.transactionHash,
      block: tx.epochNumber,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      symbol: tx.transferTokenInfo?.symbol || '',
      name: tx.transferTokenInfo?.name || '',
      decimals: tx.transferTokenInfo?.decimals || 18,
      timestamp: tx.timestamp,
    }))

    return { list: parsed, total }
  } catch (err) {
    console.error('❌ ERC20 API error:', err)
    return { list: [], total: 0 }
  }
}


export type TokenHolding = {
  address: string
  name: string
  symbol: string
  decimals: number
  amount: number
  iconUrl?: string
  price?: number | null
  totalPrice?: number | null
}

export async function getTokenHoldings(address: string): Promise<TokenHolding[]> {
  const url = `https://chainscan-galileo.0g.ai/v1/token?accountAddress=${address}&fields=iconUrl`

  try {
    const res = await fetch(url)
    const data = await res.json()
    return data.result?.list.map((item: any) => ({
      address: item.address,
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals,
      amount: item.amount,
      iconUrl: item.iconUrl,
      price: item.price ?? null,
      totalPrice: item.totalPrice ?? null,
    })) || []
  } catch (e) {
    console.error(e)
    return []
  }
}

export async function getTokenContractDetail(address: string) {
  const url = `https://chainscan-galileo.0g.ai/v1/contract/${address}?fields=name&fields=iconUrl&fields=sponsor&fields=admin&fields=from&fields=website&fields=transactionHash&fields=cfxTransferCount&fields=erc20TransferCount&fields=erc721TransferCount&fields=erc1155TransferCount&fields=stakingBalance&fields=sourceCode&fields=abi&fields=isRegistered&fields=verifyInfo`

  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch token contract detail')
  const data = await res.json()
  return data.result
}

export async function getTokenByAddress(address: string) {
  const url = `https://chainscan-galileo.0g.ai/stat/tokens/by-address?address=${address}&fields=iconUrl&fields=transferCount&fields=price&fields=totalPrice&fields=quoteUrl`

  try {
    const res = await fetch(url)
    const json = await res.json()
    return json.result
  } catch (err) {
    console.error('❌ Failed to fetch token by address:', err)
    return null
  }
}

export async function getTokenHolders(tokenAddress: string, limit = 10, skip = 0) {
  const url = `https://chainscan-galileo.0g.ai/stat/tokens/holder-rank?address=${tokenAddress}&limit=${limit}&orderBy=balance&reverse=true&skip=${skip}&tab=holders`

  try {
    const res = await fetch(url)
    const json = await res.json()
    return json.result?.list || []
  } catch (err) {
    console.error('❌ Failed to fetch token holders:', err)
    return []
  }
}

export async function getTokenTransfers(tokenAddress: string, limit = 10, skip = 0) {
  const url = `https://chainscan-galileo.0g.ai/v1/transfer?address=${tokenAddress}&limit=${limit}&skip=${skip}&tab=transfers&transferType=ERC20`

  try {
    const res = await fetch(url)
    const json = await res.json()
    return json.result?.list || []
  } catch (err) {
    console.error('❌ Failed to fetch token transfers:', err)
    return []
  }
}

export async function getTokenDailyStats(address: string) {
  const url = `https://chainscan-galileo.0g.ai/stat/daily-token-stat?limit=365&intervalType=day&base32=${address}`
  const res = await fetch(url)
  const json = await res.json()
  return json.result.list || []
}
export async function getStorageTxCount(from: string): Promise<number> {
  const url = `https://chainscan-galileo.0g.ai/v1/transaction?accountAddress=${from}&limit=10&reverse=true&skip=0&to=0x3A0d1d67497Ad770d6f72e7f4B8F0BAbaa2A649C`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch storage tx count')

    const data = await res.json()
    return data?.result?.total ?? 0
  } catch (err) {
    console.error('❌ getStorageTxCount error:', err)
    return 0
  }
}
export async function getMinerReward(address: string): Promise<string> {
  const url = `https://storagescan-galileo.0g.ai/api/miners/${address}?network=turbo`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch miner reward')

    const data = await res.json()
    return data?.data?.totalReward ?? '0'
  } catch (err) {
    console.error('❌ getMinerReward error:', err)
    return '0'
  }
}

export async function getNetworkDashboard() {
  const res = await fetch('https://chainscan-galileo.0g.ai/v1/homeDashboard')
  if (!res.ok) throw new Error('Failed to fetch home dashboard')
  const json = await res.json()
  return json.result
}

export async function getLatestPlotStats() {
  const res = await fetch('https://chainscan-galileo.0g.ai/v1/plot?interval=133&limit=7')
  if (!res.ok) throw new Error('Failed to fetch plot stats')
  const json = await res.json()
  return json.result?.list?.at(-1)
}
export async function getGasPriceInfo() {
  try {
    const res = await fetch('https://chainscan-galileo.0g.ai/stat/gasprice/tracker')
    if (!res.ok) throw new Error('Failed to fetch gas price info')
    const json = await res.json()
    return json.result.gasPriceInfo || {}
  } catch (err) {
    console.error('❌ Gas Price API error:', err)
    return {}
  }
}
// src/lib/rpc.ts

export async function getLatestTransactions(limit = 10, skip = 0) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const t = today.getTime() // timestamp UTC today 00:00

  const url = `https://chainscan-galileo.0g.ai/v1/transaction?limit=${limit}&skip=${skip}&t=${t}&tab=transactions`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch latest transactions')

    const json = await res.json()
    const result = json.result || {}
    return {
      total: result.total || 0,
      list: result.list || []
    }
  } catch (err) {
    console.error('❌ Latest Transactions API error:', err)
    return { total: 0, list: [] }
  }
}
export async function getBlockByHash(hash: string) {
  try {
    const res = await fetch(`https://chainscan-galileo.0g.ai/v1/block/${hash}`)
    const data = await res.json()
    return data.result
  } catch (err) {
    console.error('Failed to fetch block:', err)
    return null
  }
}

// src/lib/rpc.ts

const API_BASE = 'https://chainscan-galileo.0g.ai/v1'

export async function getBlockDetailByHash(hash: string) {
  try {
    const res = await fetch(`${API_BASE}/block/${hash}`)
    const data = await res.json()
    return data?.result || null
  } catch (err) {
    console.error('Error fetching block by hash:', err)
    return null
  }
}

export async function getBlockDetailByNumber(number: number) {
  try {
    const res = await fetch(`${API_BASE}/block/${number}`)
    const data = await res.json()
    return data?.result || null
  } catch (err) {
    console.error('Error fetching block by number:', err)
    return null
  }
}

export async function getTransactionsByBlockHash(
  hash: string,
  limit = 10,
  skip = 0
): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/transaction?blockHash=${hash}&limit=${limit}&skip=${skip}&tab=transactions`)
    const data = await res.json()

    if (data.status !== '1') {
      console.error('Failed to fetch transactions:', data.message)
      return []
    }

    // Convert from/to addresses if net16601:
    const txs = data.result.list
    const enriched = await Promise.all(
      txs.map(async (tx: any) => {
        const [from, to] = await Promise.all([
          convertToEvmAddress(tx.from),
          convertToEvmAddress(tx.to),
        ])
        return { ...tx, from, to }
      })
    )
    return enriched
  } catch (err) {
    console.error('Error fetching transactions:', err)
    return []
  }
}

export async function convertToEvmAddress(bech32: string): Promise<string> {
  if (!bech32?.startsWith('net16601:')) return bech32
  try {
    const res = await fetch(`${API_BASE}/account/${bech32}?fields=cfxTransferCount`)
    const data = await res.json()
    return data?.result?.address || bech32
  } catch {
    return bech32
  }
}