'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faWallet, faList, faServer, faCube, faChartLine } from '@fortawesome/free-solid-svg-icons'
import type { TokenHolding } from '@/lib/rpc'

import {
  getERC20Transfers,
  getTokenHoldings,
  getAddressDetail,
  getAddressTransactions,
  getStorageTxCount,
  getMinerReward,
  getMinerRank,
  ERC20Tx,
  AddressDetail,
  NativeTx
} from '@/lib/rpc'
import TokenTable from '@/components/TokenTable'
import { Copy } from 'lucide-react'
import Link from 'next/link'

function formatAge(secondsAgo: number) {
  const days = Math.floor(secondsAgo / (3600 * 24))
  const hours = Math.floor((secondsAgo % (3600 * 24)) / 3600)
  const minutes = Math.floor((secondsAgo % 3600) / 60)
  return `${days}d ${hours}h ${minutes}m`
}

type TabType = 'transactions' | 'erc20' | 'tokens'

export default function AddressClientPage() {
  const { addr } = useParams() as { addr: string }

  const [addressDetail, setAddressDetail] = useState<AddressDetail | null>(null)
  const [erc20Txs, setErc20Txs] = useState<ERC20Tx[]>([])
  const [erc20Total, setErc20Total] = useState(0)
  const [erc20Page, setErc20Page] = useState(0)
  const [nativeTxs, setNativeTxs] = useState<NativeTx[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [txPage, setTxPage] = useState(0)
  const [tokens, setTokens] = useState<TokenHolding[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('transactions')
  const [storageCount, setStorageCount] = useState<number>(0)
  const [miningReward, setMiningReward] = useState<string>('0')
  const [minerRank, setMinerRank] = useState<number | null>(null)

  const short = (str?: string) =>
    str && str.length >= 10 ? str.slice(0, 6) + '...' + str.slice(-4) : str || '-'

  useEffect(() => {
    async function loadAddress() {
      try {
        const [detail, heldTokens, storageTx, miner, rank] = await Promise.all([
          getAddressDetail(addr),
          getTokenHoldings(addr),
          getStorageTxCount(addr),
          getMinerReward(addr),
          getMinerRank(addr)
        ])
        setAddressDetail(detail)
        setTokens(heldTokens)
        setStorageCount(storageTx)
        setMiningReward(miner)
        setMinerRank(rank)
      } catch (e) {
        console.error('Failed to fetch address info', e)
      }
    }

    loadAddress()
  }, [addr])

  useEffect(() => {
    if (activeTab === 'transactions') {
      getAddressTransactions(addr, 10, txPage * 10)
        .then(data => {
          setNativeTxs(data.list)
          setTxTotal(data.total)
        })
        .catch(console.error)
    }
  }, [addr, txPage, activeTab])

  useEffect(() => {
    if (activeTab === 'erc20') {
      getERC20Transfers(addr, 10, erc20Page * 10)
        .then(data => {
          setErc20Txs(data.list)
          setErc20Total(data.total)
        })
        .catch(console.error)
    }
  }, [addr, erc20Page, activeTab])

  return (
    <main className="page-container">
      <h2 className="address-title">Address</h2>
      <div className="address-bar">
        <span className="address-hash">{addr}</span>
        <button onClick={() => navigator.clipboard.writeText(addr)} title="Copy" className="copy-btn">
          <Copy size={14} />
        </button>
      </div>

      <div className="stats-grid">
        {[
          { 
            label: 'Balance', 
            value: addressDetail ? (Number(addressDetail.balance) / 1e18).toFixed(3) + ' 0G' : '...', 
            icon: faWallet, 
            colorClass: 'text-yellow-400' 
          },
          { 
            label: 'Tokens', 
            value: tokens.length, 
            icon: faCoins, 
            colorClass: 'text-cyan-400' 
          },
          { 
            label: 'Nonce', 
            value: addressDetail?.nonce ?? '...', 
            icon: faList, 
            colorClass: 'text-pink-400' 
          },
          { 
            label: 'Storage Txns', 
            value: storageCount, 
            icon: faServer, 
            colorClass: 'text-purple-400' 
          },
          { 
            label: 'Mining Reward', 
            value: (Number(miningReward) / 1e18).toFixed(4) + ' 0G', 
            icon: faCube, 
            colorClass: 'text-green-400' 
          },
          { 
            label: 'Miner Rank', 
            value: minerRank ? `#${minerRank}` : '-', 
            icon: faChartLine, 
            colorClass: 'text-red-400' 
          },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-title">{item.label}</p>
                <p className="stat-value">{item.value}</p>
              </div>
              <FontAwesomeIcon icon={item.icon} className={`text-3xl ${item.colorClass}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="tab-section">
        <div className="tab-header">
          {(['transactions', 'erc20', 'tokens'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'transactions' ? 'Transactions' : tab === 'erc20' ? 'ERC20 Txns' : 'Token Holdings'}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Txn Hash</th>
                    <th>Method</th>
                    <th>Block</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Gas</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {nativeTxs.map((tx, i) => (
                    <tr key={`${tx.hash}-${i}`}>
                      <td>
                        <Link href={`/tx/${tx.hash}`} className="text-blue-400 hover:underline">
                          {short(tx.hash)}
                        </Link>
                      </td>
                      <td className="text-yellow-400">{tx.method || '-'}</td>
                      <td>
                        <Link href={`/block/${tx.epochNumber}`} className="hover:underline">
                          {tx.epochNumber}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/address/${tx.from}`} className="hover:underline">
                          {short(tx.from)}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/address/${tx.to}`} className="hover:underline">
                          {short(tx.to)}
                        </Link>
                      </td>
                      <td className="text-emerald-400">
                        {(Number(tx.gasFee) / 1e18).toFixed(6)} 0G
                      </td>
                      <td className="text-gray-400">
                        {tx.timestamp ? `${formatAge(Math.floor(Date.now() / 1000 - tx.timestamp))} ago` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-6 px-4">
                <button
                  disabled={txPage === 0}
                  onClick={() => setTxPage(p => Math.max(p - 1, 0))}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Page {txPage + 1} of {Math.ceil(txTotal / 10)}
                </span>
                <button
                  disabled={(txPage + 1) * 10 >= txTotal}
                  onClick={() => setTxPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeTab === 'erc20' && (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Txn Hash</th>
                    <th>Block</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Qty</th>
                    <th>Token</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {erc20Txs.map((tx, i) => {
                    const qty = (Number(tx.value) / 10 ** tx.decimals).toFixed(4)
                    return (
                      <tr key={`${tx.hash}-${i}`}>
                        <td>
                          <Link href={`/tx/${tx.hash}`} className="text-blue-400 hover:underline">
                            {short(tx.hash)}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/block/${tx.block}`} className="hover:underline">
                            {tx.block}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/address/${tx.from}`} className="hover:underline">
                            {short(tx.from)}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/address/${tx.to}`} className="hover:underline">
                            {short(tx.to)}
                          </Link>
                        </td>
                        <td className="text-emerald-400">{qty}</td>
                        <td className="text-yellow-400">
                          <Link href={`/token/${tx.tokenAddress}`} className="hover:underline">
                            {short(tx.name)}
                          </Link>
                        </td>
                        <td className="text-gray-400">
                          {tx.timestamp ? `${formatAge(Math.floor(Date.now() / 1000 - tx.timestamp))} ago` : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-6 px-4">
                <button
                  disabled={erc20Page === 0}
                  onClick={() => setErc20Page(p => Math.max(p - 1, 0))}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Page {erc20Page + 1} of {Math.ceil(erc20Total / 10)}
                </span>
                <button
                  disabled={(erc20Page + 1) * 10 >= erc20Total}
                  onClick={() => setErc20Page(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="p-4">
              <TokenTable tokens={tokens} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}