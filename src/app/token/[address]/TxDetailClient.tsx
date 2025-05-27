'use client'

import Link from 'next/link'
import { formatEther } from 'ethers'
import type { TxWithReceipt } from '@/lib/rpc'

interface Props {
  data: TxWithReceipt
}

export default function TxDetailClient({ data }: Props) {
  const { tx, receipt } = data

  if (!tx || !receipt) {
    return <div className="p-6">Transaction not found.</div>
  }

  const gasUsed = BigInt(receipt.gasUsed ?? '0')
  const gasPrice = BigInt(tx.gasPrice ?? '0')
  const gasFeeFormatted = formatEther(gasUsed * gasPrice)

  const rows = [
    { label: 'Transaction Hash', value: tx.hash },
    {
      label: 'Block Height',
      value: <Link href={`/block/${tx.blockNumber}`} className="text-link">{tx.blockNumber}</Link>
    },
    {
      label: 'Status',
      value: receipt.status === 1
        ? <span className="text-success">Success</span>
        : <span className="text-error">Failed</span>
    },
    {
      label: 'From',
      value: <Link href={`/address/${tx.from}`} className="text-link">{tx.from}</Link>
    },
    {
      label: 'To',
      value: <Link href={`/address/${tx.to}`} className="text-link">{tx.to}</Link>
    },
    { label: 'Value', value: `${(Number(tx.value) / 1e18).toLocaleString()} 0G` },
    { label: 'Gas Fee', value: `${gasFeeFormatted} 0G` },
    { label: 'Gas Price', value: `${Number(tx.gasPrice) / 1e9} Gneuron` },
    { label: 'Nonce', value: tx.nonce },
    {
      label: 'Input Data',
      value: <code className="input-code">{tx.data}</code>
    }
  ]

  return (
    <main className="tx-container">
      <h1 className="tx-title">Transaction</h1>
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
    </main>
  )
}
