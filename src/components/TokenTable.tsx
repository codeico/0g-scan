'use client'

import { TokenHolding } from '@/lib/rpc'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  tokens: TokenHolding[]
}

export default function TokenTable({ tokens }: Props) {
  const formatUsd = (value: number | null | undefined) =>
    value != null
      ? `$${Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '-'

  const short = (str?: string) =>
    str && str.length >= 10 ? str.slice(0, 6) + '...' + str.slice(-4) : str || '-'

  return (
    <div className="card overflow-x-auto mt-6 border border-[#30363d] rounded-xl bg-[#161b22]">
      <table className="min-w-full text-sm table-auto">
        <thead className="text-[#00bfff] border-b border-[#30363d] text-left">
          <tr>
            <th className="px-4 py-2">Token</th>
            <th className="px-4 py-2 text-left">Contract</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.address}
              className="border-t border-[#30363d] hover:bg-[#0d1117]"
            >
              <td className="px-4 py-2 flex items-center gap-2 text-white">
                <Image
                  src={token.iconUrl || '/0g-logos.png'}
                  alt={token.symbol}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full border border-[#30363d]"
                />
                <span>
                  {token.name}{' '}
                  <span className="text-gray-400">({token.symbol})</span>
                </span>
              </td>
              <td className="px-4 py-2 text-left text-blue-400">
                <Link href={`/token/${token.address}`} className="hover:underline">
                  {short(token.address)}
                </Link>
              </td>
              <td className="px-4 py-2 text-left text-[#00ff99] font-medium">
                {Number(token.amount).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-[#66ccff]">{formatUsd(token.price)}</td>
              <td className="px-4 py-2 text-[#ff66cc] font-medium">
                {formatUsd(token.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
