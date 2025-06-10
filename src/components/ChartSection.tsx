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

  const customTooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-md)'
  }

  const customLabelStyle = {
    color: 'var(--text-primary)'
  }

  return (
    <div className="chart-grid">
      {/* Txn Count Chart */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2>Txn Count</h2>
            <p>The total number of transactions per day on the 0G network.</p>
          </div>
          <a href="#" style={{ fontSize: '0.875rem' }}>View Details</a>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={txnData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis 
              dataKey="statTime" 
              tickFormatter={date => date.slice(5, 10)} 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <YAxis 
              tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              labelStyle={customLabelStyle}
              wrapperClassName="chart-tooltip"
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="var(--accent-blue)" 
              strokeWidth={2} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Account Growth Chart */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2>Account Growth</h2>
            <p>The number of new accounts added per day on the 0G network.</p>
          </div>
          <a href="#" style={{ fontSize: '0.875rem' }}>View Details</a>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={accountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis 
              dataKey="statTime" 
              tickFormatter={date => date.slice(5, 10)} 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <YAxis 
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} 
              stroke="var(--text-secondary)" 
              fontSize={12}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              labelStyle={customLabelStyle}
              wrapperClassName="chart-tooltip"
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="var(--accent-cyan)" 
              strokeWidth={2} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}