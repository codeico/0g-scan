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
    <section className="bg-[#161b22] border border-[#30363d] text-[#e6edf3] p-4 rounded-xl shadow">
      {loading ? (
        <p className="text-sm text-gray-400">Loading transactions...</p>
      ) : txs.length === 0 ? (
        <p className="text-sm text-red-400">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto">
            <thead className="text-[#ff66cc]">
              <tr className="border-b border-[#30363d]">
                <th className="py-2 px-2 text-left">Tx Hash</th>
                <th className="py-2 px-2 text-left">From</th>
                <th className="py-2 px-2 text-left">To</th>
                <th className="py-2 px-2 text-left">Value</th>
                <th className="py-2 px-2 text-left">Gas</th>
                <th className="py-2 px-2 text-left">Age</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx.hash} className="border-b border-[#30363d] hover:bg-[#1f2937]">
                  <td className="py-2 px-2 text-blue-400">
                    <Link href={`/tx/${tx.hash}`} className="hover:underline">
                      {tx.hash.slice(0, 10)}...
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-[#00bfff]">
                    <Link href={`/address/${tx.from}`} className="hover:underline">
                      {tx.from.slice(0, 10)}...
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-[#00ff99]">
                    {tx.to ? (
                      <Link href={`/address/${tx.to}`} className="hover:underline">
                        {tx.to.slice(0, 10)}...
                      </Link>
                    ) : (
                      <span className="italic text-gray-400">Contract Creation</span>
                    )}
                  </td>
                  <td className="py-2 px-2">{(Number(tx.value) / 1e18).toFixed(4)} 0G</td>
                  <td className="py-2 px-2 text-[#ffcc00]">{(Number(tx.gasFee) / 1e18).toFixed(6)} 0G</td>
                  <td className="py-2 px-2 text-gray-400">{formatAge(tx.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
