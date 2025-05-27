'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getBlockDetailByHash,
  getBlockDetailByNumber,
  getTransactionsByBlockHash,
  BlockDetail,
  Transaction,
} from '@/lib/rpc'
import { formatDistanceToNow } from 'date-fns'
import './block.css'

type Tab = 'overview' | 'transactions'

function truncate(str: string, length = 10): string {
  return str.length > length ? `${str.slice(0, 6)}...${str.slice(-4)}` : str
}


export default function BlockPage() {
  const params = useParams()
  const value = params?.value as string
  const [tab, setTab] = useState<Tab>('overview')
  const [block, setBlock] = useState<BlockDetail | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTx, setTotalTx] = useState(0)
  const limit = 10

  useEffect(() => {
    async function fetchBlockData() {
      try {
        let blockData: BlockDetail | null = null
        if (/^0x[a-fA-F0-9]{64}$/.test(value)) {
          blockData = await getBlockDetailByHash(value)
        } else if (/^\d+$/.test(value)) {
          blockData = await getBlockDetailByNumber(Number(value))
        }

        if (blockData) {
          setBlock(blockData)
          setTotalTx(blockData.transactionCount || 0)
        } else {
          setBlock(null)
          setTotalTx(0)
        }
      } catch (err) {
        console.error('Failed to fetch block data:', err)
        setBlock(null)
        setTotalTx(0)
      }
    }

    fetchBlockData()
  }, [value])

  useEffect(() => {
    async function fetchTransactions() {
      if (tab !== 'transactions' || !block?.hash) return

      try {
        const txList: Transaction[] = await getTransactionsByBlockHash(
          block.hash,
          limit,
          (currentPage - 1) * limit
        )
        setTxs(txList || [])
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
        setTxs([])
      }
    }

    fetchTransactions()
  }, [block?.hash, tab, currentPage])

  if (!block) {
    return <div className="block-container">Block not found.</div>
  }

  const gasUsed = Number(block.gasUsed ?? 0)
  const gasLimit = Number(block.gasLimit ?? 1)
  const percentGasUsed = (gasUsed / gasLimit) * 100
  const timestamp = block.timestamp
    ? new Date(block.timestamp * 1000).toLocaleString()
    : 'Unknown'

  return (
    <main className="block-container">
      <h1 className="block-title">Block</h1>

      <div className="block-tabs">
        <button
          className={tab === 'overview' ? 'active-tab' : ''}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={tab === 'transactions' ? 'active-tab' : ''}
          onClick={() => setTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {tab === 'overview' && (
        <div className="block-card">
          <div className="block-row">
            <span>Block Height</span>
            <span>{block.epochNumber?.toLocaleString()}</span>
          </div>
          <div className="block-row">
            <span>Difficulty</span>
            <span>{block.difficulty}</span>
          </div>
          <div className="block-row">
            <span>Block Hash</span>
            <span className="wrap">{block.hash}</span>
          </div>
          <div className="block-row">
            <span>Parent Hash</span>
            <span className="wrap">
              <Link href={`/block/${block.parentHash}`} className="link">
                {block.parentHash}
              </Link>
            </span>
          </div>
          <div className="block-row">
            <span>Nonce</span>
            <span>{block.nonce}</span>
          </div>
          <div className="block-row">
            <span>Transactions</span>
            <span>{block.transactionCount}</span>
          </div>
          <div className="block-row">
            <span>Limit | Gas Used</span>
            <span>
              {gasLimit} | {gasUsed} ({percentGasUsed.toFixed(2)}%)
            </span>
          </div>
          <div className="block-row">
            <span>Timestamp</span>
            <span>{timestamp}</span>
          </div>
          <div className="block-row">
            <span>Size</span>
            <span>{block.size}</span>
          </div>
        </div>
      )}

{tab === 'transactions' && (
  <div className="card overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="text-[#00bfff]">
        <tr>
          <th className="px-4 py-2">Txn Hash</th>
          <th className="px-4 py-2">From</th>
          <th className="px-4 py-2">To</th>
          <th className="px-4 py-2">Value</th>
          <th className="px-4 py-2">Txn Fee</th>
          <th className="px-4 py-2">Gas Price</th>
          <th className="px-4 py-2">Age</th>
        </tr>
      </thead>
      <tbody>
        {txs.length > 0 ? (
          txs.map((tx, i) => (
            <tr key={`${tx.hash}-${i}`} className="border-t border-[#30363d]">
              <td className="px-4 py-2 text-blue-400">
                <Link href={`/tx/${tx.hash}`} className="hover:underline">{truncate(tx.hash)}</Link>
              </td>
              <td className="px-4 py-2">
              <Link href={`/address/${tx.from}`} className="hover:underline">{truncate(tx.from)}</Link></td>
              <td className="px-4 py-2"><Link href={`/address/${tx.to}`} className="hover:underline">{truncate(tx.to)}</Link></td>
              <td className="px-4 py-2 text-green-400">{tx.value} OG</td>
              <td className="px-4 py-2">{tx.gasFee}</td>
              <td className="px-4 py-2">{tx.gasPrice}</td>
              <td className="px-4 py-2 text-gray-400">
                {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                  addSuffix: true,
                })}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-4 py-2 text-center text-gray-400">No transactions found.</td>
          </tr>
        )}
      </tbody>
    </table>

    <div className="flex justify-between items-center mt-4">
      <button
        className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
      >
        Previous
      </button>
      <span className="text-sm text-gray-400">Page {currentPage}</span>
      <button
        className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
        disabled={currentPage * limit >= totalTx}
        onClick={() => setCurrentPage(p => p + 1)}
      >
        Next
      </button>
    </div>
  </div>
)}

    </main>
  )
}
