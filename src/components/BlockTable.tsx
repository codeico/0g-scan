'use client'

import { useEffect, useState } from 'react'
import { getLatestBlocks } from '@/lib/rpc'
import Link from 'next/link'

export default function BlockTable() {
  const [blocks, setBlocks] = useState<any[]>([])

  useEffect(() => {
    async function fetchBlocks() {
      const data = await getLatestBlocks(10)
      setBlocks(data)
    }

    fetchBlocks()
  }, [])

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2">Block</th>
              <th className="py-2">Hash</th>
              <th className="py-2">Txns</th>
              <th className="py-2">Gas Used</th>
              <th className="py-2">Age</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.number} className="border-b last:border-none">
                <td className="py-2 font-medium text-blue-600">
                  <Link href={`/block/${block.number}`}>#{block.number}</Link>
                </td>
                <td className="py-2 text-gray-600 truncate max-w-[200px]">
                  <Link href={`/tx/${block.transactions[0]}`}>{block.hash}</Link>
                </td>
                <td className="py-2">{block.transactions.length}</td>
                <td className="py-2">{block.gasUsed.toString()}</td>
                <td className="py-2 text-gray-500">
                  {Math.floor(Date.now() / 1000) - block.timestamp}s ago
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
