'use client'

import { useEffect, useState } from 'react'
import { getLatestBlocks, Block } from '@/lib/rpc'
import Link from 'next/link'

export default function BlockTable() {
  const [blocks, setBlocks] = useState<Block[]>([])

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const data: Block[] = await getLatestBlocks(10)
        setBlocks(data)
      } catch (e) {
        console.error('❌ Failed to fetch blocks:', e)
      }
    }

    fetchBlocks()
    const interval = setInterval(fetchBlocks, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Hash</th>
              <th>Txns</th>
              <th>Gas Used</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => {
              const gasUsedFormatted = Number(block.gasUsed).toLocaleString('id-ID')
              const age = Math.floor(Date.now() / 1000) - block.timestamp

              return (
                <tr key={block.epochNumber}>
                  <td>
                    <Link href={`/block/${block.epochNumber}`}>#{block.epochNumber}</Link>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link href={`/block/${block.hash}`}>
                      {block.hash}
                    </Link>
                  </td>
                  <td>{block.transactionCount}</td>
                  <td style={{ color: 'var(--accent-emerald)' }}>{gasUsedFormatted}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{age}s ago</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
