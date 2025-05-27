'use client'

import { TokenHolding } from '@/lib/rpc'
import Link from 'next/link'

type Props = {
  tokens: TokenHolding[]
}

export default function TokenTable({ tokens }: Props) {
  const formatUsd = (value: number | null | undefined) =>
    value != null ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'

  return (
    <div className="mt-6 bg-[#161b22] p-4 rounded-xl border border-[#30363d] overflow-x-auto">
      <h2 className="text-lg text-white font-bold mb-4">Token Holdings</h2>
      <table className="w-full text-sm table-auto">
        <thead className="text-[#00ff99] border-b border-[#30363d] text-left">
          <tr>
            <th className="py-2">Token</th>
            <th className="py-2">Contract</th>
            <th className="py-2 text-right">Amount</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.address} className="border-b border-[#2b2f36] hover:bg-[#1f2937]">
              <td className="py-3 flex items-center gap-2">
                <img src={token.iconUrl || '/0g-logos.png'} alt={token.symbol} className="w-5 h-5 rounded-full border border-[#30363d]" />
                <span className="text-white">{token.name} <span className="text-gray-400">({token.symbol})</span></span>
              </td>
              <td className="py-3">
                <Link href={`/token/${token.address}`} className="text-blue-400 hover:underline">
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </Link>
              </td>
              <td className="py-3 text-right text-[#00ff99] font-medium">
                {Number(token.amount).toLocaleString()}
              </td>
              <td className="py-3 text-right text-[#66ccff]">
                {formatUsd(token.price)}
              </td>
              <td className="py-3 text-right text-[#ff66cc] font-medium">
                {formatUsd(token.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
