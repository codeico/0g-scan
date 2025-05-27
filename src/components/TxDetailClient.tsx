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
      const result = await getTransactionWithReceipt(hash)
      setTxData(result)
      setLoading(false)
    }
    fetchTx()
  }, [hash])

  if (loading) return <div className="p-6">Loading...</div>
  if (!txData?.tx || !txData?.receipt) return <div className="p-6">Transaction not found.</div>

  const { tx, receipt } = txData
  const gasUsed = BigInt(receipt.gasUsed ?? '0')
  const gasPrice = BigInt(tx.gasPrice ?? '0')
  const gasFee = gasUsed * gasPrice
  const gasFeeFormatted = formatEther(gasFee)

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
