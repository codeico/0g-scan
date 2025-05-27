'use client'

import { useEffect, useState } from 'react'
import { getTxChartData } from '@/lib/rpc'
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
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchChartData() {
      const result = await getTxChartData(20)
      setData(result)
    }
    fetchChartData()
  }, [])

  return (
    <section className="bg-white p-4 rounded-xl shadow h-[300px] mb-6">
      <h2 className="text-lg font-semibold mb-2">Tx Count per Block</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="block" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="txs" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
