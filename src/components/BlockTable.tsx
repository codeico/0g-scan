'use client'

import { useEffect, useState } from 'react'
import { getLatestBlocks, Block} from '@/lib/rpc'
import Link from 'next/link'
import { formatEther } from 'ethers'


export default function BlockTable() {
  const [blocks, setBlocks] = useState<Block[]>([])

  useEffect(() => {
    async function fetchBlocks() {
      const data: (Block | null)[] = await getLatestBlocks(10)
      setBlocks(data.filter((b): b is Block => b !== null))
    }
  
    fetchBlocks()
  }, [])

  return (
    <section className="bg-[#161b22] p-4 rounded-xl shadow border border-[#30363d]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[#8b949e] border-b border-[#30363d]">
              <th className="py-2 px-2">Block</th>
              <th className="py-2 px-2">Hash</th>
              <th className="py-2 px-2">Txns</th>
              <th className="py-2 px-2">Gas Used</th>
              <th className="py-2 px-2">Age</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => {
              const gasUsedOG = formatEther(block.gasUsed)
              const age = Math.floor(Date.now() / 1000) - block.timestamp

              return (
                <tr key={block.number} className="border-b border-[#30363d] hover:bg-[#0d1117]">
                  <td className="py-2 px-2 font-medium text-[#58a6ff]">
                    <Link href={`/block/${block.number}`}>#{block.number}</Link>
                  </td>
                  <td className="py-2 px-2 text-gray-400 truncate max-w-[200px]">
                  {block.hash ? (
  <Link href={`/tx/${block.transactions[0]}`} className="hover:underline">{block.hash}</Link>
) : (
  <span className="text-gray-500">N/A</span>
)}

                  </td>
                  <td className="py-2 px-2 text-gray-300">{block.transactions.length}</td>
                  <td className="py-2 px-2 text-green-400">{gasUsedOG} OG</td>
                  <td className="py-2 px-2 text-gray-500">{age}s ago</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
