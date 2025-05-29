'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface ChartEntry {
  statTime: string
  count: number
}

async function fetchChartData(url: string): Promise<ChartEntry[]> {
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === '1') {
    return json.result.list.reverse()
  }
  return []
}

export default function ChartSection() {
  const [txnData, setTxnData] = useState<ChartEntry[]>([])
  const [accountData, setAccountData] = useState<ChartEntry[]>([])

  useEffect(() => {
    fetchChartData('https://chainscan-galileo.0g.ai/open/statistics/transaction?limit=30&intervalType=day')
      .then(setTxnData)
    fetchChartData('https://chainscan-galileo.0g.ai/open/statistics/account/growth?limit=30&intervalType=day')
      .then(setAccountData)
  }, [])

  return (
    <div className="chart-grid">
      {/* Txn Count Chart */}
      <div className="chart-card">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2>Txn Count</h2>
            <p>The total number of transactions per day on the 0G network.</p>
          </div>
          <a href="#">View Details</a>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={txnData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="statTime" tickFormatter={date => date.slice(5, 10)} stroke="#8b949e" />
            <YAxis tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} stroke="#8b949e" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              wrapperClassName="chart-tooltip"
            />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Account Growth Chart */}
      <div className="chart-card">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2>Account Growth</h2>
            <p>The number of new accounts added per day on the 0G network.</p>
          </div>
          <a href="#">View Details</a>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={accountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="statTime" tickFormatter={date => date.slice(5, 10)} stroke="#8b949e" />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} stroke="#8b949e" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              wrapperClassName="chart-tooltip"
            />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
