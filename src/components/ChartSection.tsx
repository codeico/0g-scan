'use client'

import { useEffect, useState } from 'react'
import { getTxChartData, TxChartEntry } from '@/lib/rpc'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function ChartSection() {
  const [data, setData] = useState<TxChartEntry[]>([])

  useEffect(() => {
    async function fetchChartData() {
      const result = await getTxChartData(20)
      setData(result)
    }
    fetchChartData()
  }, [])

  return (
    <section className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl shadow h-[300px] mb-6 text-white">
      <h2 className="text-lg font-semibold mb-2 text-white">Tx Count per Block</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke="#30363d" strokeDasharray="3 3" />
          <XAxis dataKey="block" stroke="#8b949e" />
          <YAxis stroke="#8b949e" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="txs" stroke="#58a6ff" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
