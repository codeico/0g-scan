'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getTokenContractDetail,
  getTokenHolders,
  getTokenTransfers,
  getTokenDailyStats,
  getTokenByAddress
} from '@/lib/rpc'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts'

type Tab = 'transfers' | 'holders' | 'analysis'

export default function TokenPage() {
  const params = useParams()
  const tokenAddress = params?.address as string

  const [tab, setTab] = useState<Tab>('transfers')
  const [token, setToken] = useState<any>(null)
  const [holders, setHolders] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const short = (addr: string) => addr?.slice(0, 6) + '...' + addr?.slice(-4)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [tokenInfo, holderList, transferList, dailyStats] = await Promise.all([
          getTokenByAddress(tokenAddress),
          getTokenHolders(tokenAddress),
          getTokenTransfers(tokenAddress),
          getTokenDailyStats(tokenAddress)
        ])
        setToken(tokenInfo)
        setHolders(holderList)
        setTransfers(transferList)
        setStats(dailyStats.reverse())
      } catch (err) {
        console.error('Failed to fetch token data:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [tokenAddress])

  return (
    <main className="token-page">
      <h1 className="token-title">
        <img src={token?.iconUrl || '/0g-logos.png'} width={24} height={24} alt="Token Icon" />
        {token?.name || 'Unknown'} <span className="token-symbol">({token?.symbol || '...'})</span>
      </h1>

      <div className="token-info-grid">
        <div>
          <p><strong>Price:</strong> {token?.price ? `$${token.price}` : 'Not Available'}</p>
          <p><strong>Market Cap:</strong> {token?.totalPrice ? `$${token.totalPrice}` : '--'}</p>
          <p><strong>Total Supply:</strong> {token?.totalSupply ? `${Number(token.totalSupply) / 1e18} ${token?.symbol}` : '--'}</p>
          <p><strong>Official Site:</strong> {token?.website ? <a href={token.website} className="token-link" target="_blank" rel="noreferrer">{token.website}</a> : '--'}</p>
        </div>
        <div>
          <p><strong>Contract:</strong> <Link href={`/token/${tokenAddress}`} className="token-link">{short(tokenAddress)}</Link></p>
          <p><strong>Decimals:</strong> {token?.decimals || '--'}</p>
          <p><strong>Holders:</strong> {token?.holderCount || '--'}</p>
          <p><strong>Transfers:</strong> {token?.transferCount || '--'}</p>
        </div>
      </div>

      <div className="token-tab-buttons">
        {(['transfers', 'holders', 'analysis'] as Tab[]).map(t => (
          <button
            key={t}
            className={`token-tab-button ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="token-card">
        {loading ? (
          <p>Loading...</p>
        ) : tab === 'transfers' ? (
          <div className="table-wrapper">
            <table className="token-table">
              <thead>
                <tr>
                  <th>Txn Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((tx, i) => (
                  <tr key={tx.transactionHash + i}>
                    <td><Link href={`/tx/${tx.transactionHash}`} className="token-link">{tx.transactionHash.slice(0, 10)}...</Link></td>
                    <td><Link href={`/address/${tx.from}`} className="token-link">{short(tx.from)}</Link></td>
                    <td><Link href={`/address/${tx.to}`} className="token-link">{short(tx.to)}</Link></td>
                    <td className="text-right text-green">{(Number(tx.value) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.transferTokenInfo?.symbol || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'holders' ? (
          <div className="table-wrapper">
            <table className="token-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Holder</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((h, i) => (
                  <tr key={h.account.address}>
                    <td>{i + 1}</td>
                    <td><Link href={`/address/${h.account.address}`} className="token-link">{short(h.account.address)}</Link></td>
                    <td className="text-right text-green">{(Number(h.balance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 })} {token?.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2f36" />
              <XAxis dataKey="day" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="transferCount" name="Transfer Count (Day)" stroke="#00ff99" dot={false} />
              <Line type="monotone" dataKey="uniqueReceiver" name="Unique Receivers (Day)" stroke="#ff66cc" dot={false} />
              <Line type="monotone" dataKey="uniqueSender" name="Unique Senders (Day)" stroke="#3399ff" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </main>
  )
}
