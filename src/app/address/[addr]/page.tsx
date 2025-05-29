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

    <main className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="address-title">Address</h2>
      <div className="address-bar">
        <span className="address-hash">{addr}</span>
        <button onClick={() => navigator.clipboard.writeText(addr)} title="Copy" className="copy-btn">
          <Copy size={14} />
        </button>
      </div>

      <div className="responsive-grid mb-6">
        {[
          { label: 'Balance', value: addressDetail ? (Number(addressDetail.balance) / 1e18).toFixed(3) + ' 0G' : '...', icon: faWallet, color: 'text-yellow-400' },
          { label: 'Tokens', value: tokens.length, icon: faCoins, color: 'text-cyan-400' },
          { label: 'Nonce', value: addressDetail?.nonce ?? '...', icon: faList, color: 'text-pink-400' },
          { label: 'Storage Txns', value: storageCount, icon: faServer, color: 'text-purple-400' },
          { label: 'Mining Reward', value: (Number(miningReward) / 1e18).toFixed(4) + ' 0G', icon: faCube, color: 'text-green-400' },
          { label: 'Miner Rank', value: minerRank ? `#${minerRank}` : '-', icon: faChartLine, color: 'text-red-400' },
        ].map((item, i) => (
          <div key={i} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </div>
            <FontAwesomeIcon icon={item.icon} className={`text-3xl ${item.color}`} />
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-b border-[#30363d] mb-4">
        {(['transactions', 'erc20', 'tokens'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'text-[#00bfff] font-semibold border-b-2 border-[#00bfff]' : 'text-gray-400'}`}
          >
            {tab === 'transactions' ? 'Transactions' : tab === 'erc20' ? 'ERC20 Txns' : 'Token Holdings'}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#00bfff]">
              <tr>
                <th className="px-4 py-2">Txn Hash</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Block</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Gas</th>
                <th className="px-4 py-2">Age</th>
              </tr>
            </thead>
            <tbody>
              {nativeTxs.map((tx, i) => (
                <tr key={`${tx.hash}-${i}`} className="border-t border-[#30363d] hover:bg-[#0d1117]">
                  <td className="px-4 py-2 text-blue-400">
                    <Link href={`/tx/${tx.hash}`} className="hover:underline">{short(tx.hash)}</Link></td>
                  <td className="px-4 py-2 text-yellow-400">{tx.method || '-'}</td>
                  <td className="px-4 py-2"><Link href={`/block/${tx.epochNumber}`} className="hover:underline">{tx.epochNumber}</Link></td>
                  <td className="px-4 py-2"><Link href={`/address/${tx.from}`} className="hover:underline">{short(tx.from)}</Link></td>
                  <td className="px-4 py-2"><Link href={`/address/${tx.to}`} className="hover:underline">{short(tx.to)}</Link></td>
                  <td className="px-4 py-2 text-[#00ff99]">{(Number(tx.gasFee) / 1e18).toFixed(6)} 0G</td>
                  <td className="px-4 py-2 text-gray-400">
                    {tx.timestamp ? `${formatAge(Math.floor(Date.now() / 1000 - tx.timestamp))} ago` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
              disabled={txPage === 0}
              onClick={() => setTxPage(p => Math.max(p - 1, 0))}
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {txPage + 1} of {Math.ceil(txTotal / 10)}</span>
            <button
              className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
              disabled={(txPage + 1) * 10 >= txTotal}
              onClick={() => setTxPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'erc20' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#00bfff]">
              <tr>
                <th className="px-4 py-2">Txn Hash</th>
                <th className="px-4 py-2">Block</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Token</th>
                <th className="px-4 py-2">Age</th>
              </tr>
            </thead>
            <tbody>
              {erc20Txs.map((tx, i) => {
                const qty = (Number(tx.value) / 10 ** tx.decimals).toFixed(4)
                return (
                  <tr key={`${tx.hash}-${i}`} className="border-t border-[#30363d] hover:bg-[#0d1117]">
                    <td className="px-4 py-2 text-blue-400">
                      <Link href={`/tx/${tx.hash}`} className="hover:underline">{short(tx.hash)}</Link>
                    </td>
                    <td className="px-4 py-2"><Link href={`/block/${tx.block}`} className="hover:underline">{tx.block}</Link></td>
                    <td className="px-4 py-2"><Link href={`/address/${tx.from}`} className="hover:underline">{short(tx.from)}</Link></td>
                    <td className="px-4 py-2"><Link href={`/address/${tx.to}`} className="hover:underline">{short(tx.to)}</Link></td>
                    <td className="px-4 py-2 text-[#00ff99]">{qty}</td>
                    <td className="px-4 py-2 text-yellow-400"><Link href={`/token/${tx.tokenAddress}`} className="hover:underline">{short(tx.name)}</Link></td>
                    <td className="px-4 py-2 text-gray-400">
                      {tx.timestamp ? `${formatAge(Math.floor(Date.now() / 1000 - tx.timestamp))} ago` : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
              disabled={erc20Page === 0}
              onClick={() => setErc20Page(p => Math.max(p - 1, 0))}
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {erc20Page + 1} of {Math.ceil(erc20Total / 10)}</span>
            <button
              className="text-sm text-white px-3 py-1 rounded border border-[#30363d] hover:bg-[#1f2937]"
              disabled={(erc20Page + 1) * 10 >= erc20Total}
              onClick={() => setErc20Page(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
          <TokenTable tokens={tokens} />
      )}
    </main>
  )
}