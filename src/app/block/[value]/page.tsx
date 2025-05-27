'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getBlockDetailByHash,
  getBlockDetailByNumber,
  getTransactionsByBlockHash
} from '@/lib/rpc'
import './block.css'
import { formatDistanceToNow } from 'date-fns'

type Tab = 'overview' | 'transactions'

function truncate(str: string, length = 10): string {
  return str.length > length ? `${str.slice(0, 6)}...${str.slice(-4)}` : str
}

export default function BlockPage() {
  const params = useParams()
  const value = params?.value as string
  const [tab, setTab] = useState<Tab>('overview')
  const [block, setBlock] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTx, setTotalTx] = useState(0)
  const limit = 10

  useEffect(() => {
    async function fetchData() {
      try {
        let blockData = null

        if (/^0x[a-fA-F0-9]{64}$/.test(value)) {
          blockData = await getBlockDetailByHash(value)
        } else if (/^\d+$/.test(value)) {
          blockData = await getBlockDetailByNumber(Number(value))
        }

        if (blockData) {
          setBlock(blockData)

          if (tab === 'transactions') {
            const txList = await getTransactionsByBlockHash(
              blockData.hash,
              limit,
              (currentPage - 1) * limit
            )
            setTxs(txList)
            setTotalTx(blockData.transactionCount || 0)
          }
        } else {
          setBlock(null)
          setTxs([])
        }
      } catch (err) {
        console.error('Failed to fetch block data:', err)
        setBlock(null)
        setTxs([])
      }
    }

    fetchData()
  }, [value, currentPage, tab])

  if (!block) {
    return <div className="block-container">Block not found.</div>
  }

  const gasUsed = Number(block.gasUsed)
  const gasLimit = Number(block.gasLimit)
  const percentGasUsed = (gasUsed / gasLimit) * 100
  const timestamp = new Date(block.timestamp * 1000).toLocaleString()

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
          <div className="block-row"><span>Block Height</span><span>{block.epochNumber.toLocaleString()}</span></div>
          <div className="block-row"><span>Difficulty</span><span>{block.difficulty}</span></div>
          <div className="block-row"><span>Block Hash</span><span className="wrap">{block.hash}</span></div>
          <div className="block-row"><span>Parent Hash</span><span className="wrap"><Link href={`/block/${block.parentHash}`} className="link">{block.parentHash}</Link></span></div>
          <div className="block-row"><span>Nonce</span><span>{block.nonce}</span></div>
          <div className="block-row"><span>Transactions</span><span>{block.transactionCount}</span></div>
          <div className="block-row"><span>Limit | Gas Used</span><span>{gasLimit} | {gasUsed} ({percentGasUsed.toFixed(2)}%)</span></div>
          <div className="block-row"><span>Timestamp</span><span>{timestamp}</span></div>
          <div className="block-row"><span>Size</span><span>{block.size}</span></div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="tx-table-wrapper">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Txn Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Txn Fee</th>
                <th>Gas Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {txs && txs.length > 0 ? (
                txs.map((tx, i) => (
                  <tr key={i}>
                    <td><Link href={`/tx/${tx.hash}`} className="link">{truncate(tx.hash)}</Link></td>
                    <td><Link href={`/address/${tx.from}`} className="link">{truncate(tx.from)}</Link></td>
                    <td><Link href={`/address/${tx.to}`} className="link">{truncate(tx.to)}</Link></td>
                    <td>{tx.value} OG</td>
                    <td>{tx.gasFee}</td>
                    <td>{tx.gasPrice}</td>
                    <td>{formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true })}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <span>Page {currentPage}</span>
            <button disabled={currentPage * limit >= totalTx} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </main>
  )
}
