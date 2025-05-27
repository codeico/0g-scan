'use client'

import { useEffect, useState } from 'react'
import { getNetworkDashboard, getLatestPlotStats, getGasPriceInfo } from '@/lib/rpc'

type StatItem = {
  title: string
  value: string
}

export default function NetworkStats() {
  const [stats, setStats] = useState<StatItem[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [dashboard, latestPlot, gasInfo] = await Promise.all([
          getNetworkDashboard(),
          getLatestPlotStats(),
          getGasPriceInfo(),
        ])
  
        const formatted: StatItem[] = [
          {
            title: 'Current Block Height',
            value: dashboard?.blockNumber ? Number(dashboard.blockNumber).toLocaleString() : 'N/A'
          },
          {
            title: 'TPS (Recent)',
            value: latestPlot?.tps ? parseFloat(latestPlot.tps).toFixed(2) : 'N/A'
          },
          {
            title: 'Block Time',
            value: latestPlot?.blockTime ? `${parseFloat(latestPlot.blockTime).toFixed(3)}s` : 'N/A'
          },
          {
            title: 'Gas Price (TP50)',
            value: gasInfo.tp50 ? Number(gasInfo.tp50).toLocaleString() : 'N/A'
          },
          {
            title: 'Gas Price (Max)',
            value: gasInfo.max ? Number(gasInfo.max).toLocaleString() : 'N/A'
          },
          {
            title: 'Gas Price (Min)',
            value: gasInfo.min ? Number(gasInfo.min).toLocaleString() : 'N/A'
          },
        ]
  
        setStats(formatted)
      } catch (e) {
        console.error('❌ Failed to load network stats:', e)
      }
    }
  
    loadStats()
  
    // ✅ fix here: langsung inisialisasi saat deklarasi
    const interval = setInterval(loadStats, 3000)
  
    return () => clearInterval(interval)
  }, [])
  

  return (
    <div className="network-grid">
      {stats.map((item) => (
        <div key={item.title} className="stat-card">
          <div className="stat-title">{item.title}</div>
          <div className="stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
