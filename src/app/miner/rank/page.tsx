// app/top-miners/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Miner {
  rank: number
  miner: string
  totalReward: string
  winCount: number
  miningAttempts: number
}

export default function TopMinersPage() {
  const [miners, setMiners] = useState<Miner[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 10

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://scan-devnet.0g.ai/api/stats/top/reward?network=turbo')
        const data = await res.json()
        const sorted = data.data.list.sort((a: Miner, b: Miner) => a.rank - b.rank)
        setMiners(sorted)
      } catch (err) {
        console.error('Failed to fetch miners', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pagedMiners = miners.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(miners.length / pageSize)

  return (
    <main className="max-w-7xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Top Miners</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#00bfff] border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Miner Address</th>
                <th className="px-4 py-2 text-left">Total Rewards</th>
                <th className="px-4 py-2 text-left">Win Count</th>
                <th className="px-4 py-2 text-left">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {pagedMiners.map((miner) => {
                const percentage = miner.miningAttempts > 0
                  ? (miner.winCount / miner.miningAttempts) * 100
                  : 0

                return (
                  <tr key={miner.rank} className="border-t border-[#30363d] hover:bg-[#0d1117]">
                    <td className="px-4 py-2">{miner.rank}</td>
                    <td className="px-4 py-2 text-blue-400">
                      <Link href={`/address/${miner.miner}`} className="hover:underline">
                        {miner.miner}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-[#00ff99]">
                      {(Number(miner.totalReward) / 1e18).toFixed(4)} 0G
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-row items-center gap-1.5">
                        <div className="w-[140px] h-1.5 rounded-[20px] bg-[#b4b4b4] overflow-hidden flex flex-row justify-start items-center">
                          <div
                            className="h-full rounded-[20px] bg-blue-500"
                            style={{ width: `${percentage.toFixed(2)}%` }}
                          ></div>
                        </div>
                        <p className="text-[#b4b4b4] text-sm">
                          {miner.winCount} ({percentage.toFixed(2)}%)
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{miner.miningAttempts}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              className="button"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(p - 1, 0))}
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
            <button
              className="button"
              disabled={(page + 1) * pageSize >= miners.length}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  )
}