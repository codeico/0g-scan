'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTransactionWithReceipt } from '@/lib/rpc'
import { formatEther } from 'ethers'
import Link from 'next/link'

export default function TxDetailClient() {
  const params = useParams()
  const hash = params?.hash as string

  const [loading, setLoading] = useState(true)
  const [txData, setTxData] = useState<Awaited<ReturnType<typeof getTransactionWithReceipt>> | null>(null)

  useEffect(() => {
    if (!hash) return
    const fetchTx = async () => {
      try {
        const result = await getTransactionWithReceipt(hash)
        setTxData(result)
      } catch (error) {
        console.error('Failed to fetch transaction:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTx()
  }, [hash])

  if (loading) {
    return (
      <main className="tx-container">
        <div className="card">
          <div className="text-center py-8">
            <div className="loading text-lg" style={{ color: 'var(--text-secondary)' }}>
              Loading transaction details...
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!txData?.tx || !txData?.receipt) {
    return (
      <main className="tx-container">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Transaction not found
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              The transaction hash you&#39;re looking for doesn&#39;t exist or hasn&#39;t been processed yet.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const { tx, receipt } = txData
  const gasUsed = BigInt(receipt.gasUsed ?? '0')
  const gasPrice = BigInt(tx.gasPrice ?? '0')
  const gasFee = gasUsed * gasPrice
  const gasFeeFormatted = formatEther(gasFee)

  const rows = [
    {
      label: 'Transaction Hash',
      value: (
        <code className="font-mono text-sm break-all" style={{ color: 'var(--text-primary)' }}>
          {tx.hash}
        </code>
      )
    },
    {
      label: 'Block Height',
      value: (
        <Link href={`/block/${tx.blockNumber}`} className="font-medium">
          #{tx.blockNumber}
        </Link>
      )
    },
    {
      label: 'Status',
      value: receipt.status === 0
        ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            ✓ Success
          </span>
        )
        : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            ✗ Failed
          </span>
        )
    },
    {
      label: 'From',
      value: (
        <Link href={`/address/${tx.from}`} className="font-mono text-sm">
          {tx.from}
        </Link>
      )
    },
    {
      label: 'To',
      value: tx.to ? (
        <Link href={`/address/${tx.to}`} className="font-mono text-sm">
          {tx.to}
        </Link>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>Contract Creation</span>
      )
    },
    {
      label: 'Value',
      value: (
        <span className="font-medium text-emerald-400">
          {(Number(tx.value) / 1e18).toLocaleString()} 0G
        </span>
      )
    },
    {
      label: 'Gas Fee',
      value: (
        <span className="font-medium text-amber-400">
          {gasFeeFormatted} 0G
        </span>
      )
    },
    {
      label: 'Gas Price',
      value: (
        <span style={{ color: 'var(--text-secondary)' }}>
          {Number(tx.gasPrice) / 1e9} Gneuron
        </span>
      )
    },
    {
      label: 'Gas Used',
      value: (
        <span style={{ color: 'var(--text-secondary)' }}>
          {receipt.gasUsed?.toLocaleString()}
        </span>
      )
    },
    {
      label: 'Nonce',
      value: (
        <span style={{ color: 'var(--text-secondary)' }}>
          {tx.nonce}
        </span>
      )
    },
    {
      label: 'Input Data',
      value: tx.data && tx.data !== '0x' ? (
        <div className="mt-2">
          <details>
            <summary className="cursor-pointer text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>
              View Input Data ({tx.data.length} bytes)
            </summary>
            <div
              className="mt-2 p-3 rounded-lg font-mono text-xs break-all overflow-x-auto"
              style={{
                background: 'var(--bg-accent)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              {tx.data}
            </div>
          </details>
        </div>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>No input data</span>
      )
    }
  ]

  return (
    <main className="tx-container fade-in-up">
      <h1 className="tx-title">Transaction Details</h1>

      <div className="tx-card">
        <table className="tx-table">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="tx-label">{row.label}</td>
                <td className="tx-value">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Transaction Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-title">Block Confirmations</div>
          <div className="stat-value text-lg">
            {tx.blockNumber > 0 ? 'Confirmed' : 'Pending'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Transaction Index</div>
          <div className="stat-value text-lg">
            {tx.transactionIndex !== undefined ? tx.transactionIndex : '-'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Gas Limit</div>
          <div className="stat-value text-lg">
            {tx.gasLimit ? Number(tx.gasLimit).toLocaleString() : '-'}
          </div>
        </div>
      </div>
    </main>
  )
}