import { JsonRpcProvider } from 'ethers'
import { NextResponse } from 'next/server'

const RPC_URL = 'https://0g.bangcode.id'
const provider = new JsonRpcProvider(RPC_URL)

export async function GET() {
  try {
    const latestBlockNumber = await provider.getBlockNumber()

    const blockCount = 10
    const blocks = await Promise.all(
      [...Array(blockCount)].map((_, i) => provider.getBlock(latestBlockNumber - i))
    )

    const gasUsedSum = blocks.reduce((sum, b) => sum + BigInt(b.gasUsed?.toString() || '0'), 0n)
    const timeDelta = Number(blocks[0].timestamp - blocks[blocks.length - 1].timestamp)
    const gasUsedPerSecond = timeDelta > 0 ? Number(gasUsedSum) / timeDelta : 0

    // Hitung total transaksi dari 100 blok terakhir
    const txCountBlock = 100
    const txBlocks = await Promise.all(
      [...Array(txCountBlock)].map((_, i) => provider.getBlock(latestBlockNumber - i))
    )

    const transactionCount = txBlocks.reduce((sum, b) => sum + b.transactions.length, 0)

    // Hitung address & contract dari transaksi
    const uniqueAddresses = new Set<string>()
    let contractCount = 0

    for (const block of txBlocks) {
      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash)
        if (!tx) continue
        if (!tx.to) contractCount += 1
        else uniqueAddresses.add(tx.to.toLowerCase())
        uniqueAddresses.add(tx.from.toLowerCase())
      }
    }

    const result = {
      status: '1',
      message: '',
      result: {
        addressCount: uniqueAddresses.size,
        transactionCount,
        contractCount,
        epochNumber: latestBlockNumber, // fallback
        blockNumber: latestBlockNumber,
        gasUsedPerSecond: Math.round(gasUsedPerSecond),
      },
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: '0', message: 'Error fetching data', result: null }, { status: 500 })
  }
}
