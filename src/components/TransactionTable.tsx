'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLatestTransactions, Transaction } from '@/lib/rpc'

export default function TransactionTable() {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTxs() {
      try {
        const { list } = await getLatestTransactions(10)
        setTxs(list)
      } catch (err) {
        console.error('❌ Failed to fetch transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTxs()
    const interval = setInterval(fetchTxs, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatAge = (timestamp: number) => {
    const secondsAgo = Math.floor(Date.now() / 1000 - timestamp)
    const days = Math.floor(secondsAgo / (3600 * 24))
    const hours = Math.floor((secondsAgo % (3600 * 24)) / 3600)
    const minutes = Math.floor((secondsAgo % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m ago`
  }

  return (
    <div style={{ padding: '2rem' }}>
      {loading ? (
        <p className="loading" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Loading transactions...
        </p>
      ) : txs.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--accent-pink)' }}>
          No transactions found.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Tx Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Gas</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx.hash}>
                  <td>
                    <Link href={`/tx/${tx.hash}`}>
                      {tx.hash.slice(0, 10)}...
                    </Link>
                  </td>
                  <td style={{ color: 'var(--accent-cyan)' }}>
                    <Link href={`/address/${tx.from}`}>
                      {tx.from.slice(0, 10)}...
                    </Link>
                  </td>
                  <td style={{ color: 'var(--accent-emerald)' }}>
                    {tx.to ? (
                      <Link href={`/address/${tx.to}`}>
                        {tx.to.slice(0, 10)}...
                      </Link>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Contract Creation
                      </span>
                    )}
                  </td>
                  <td>{(Number(tx.value) / 1e18).toFixed(4)} 0G</td>
                  <td style={{ color: 'var(--accent-amber)' }}>
                    {(Number(tx.gasFee) / 1e18).toFixed(6)} 0G
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {formatAge(tx.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}