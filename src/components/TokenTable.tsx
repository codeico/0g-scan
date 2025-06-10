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

  if (tokens.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <p>No tokens found for this address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Contract</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.address}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={token.iconUrl || '/0g-logos.png'}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                      style={{ 
                        border: '1px solid var(--border-primary)',
                        background: 'var(--bg-accent)'
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {token.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {token.symbol}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <Link 
                  href={`/token/${token.address}`} 
                  className="font-mono text-sm"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  {short(token.address)}
                </Link>
              </td>
              <td>
                <span className="font-medium text-emerald-400">
                  {Number(token.amount).toLocaleString()}
                </span>
              </td>
              <td>
                <span className="text-cyan-400">
                  {formatUsd(token.price)}
                </span>
              </td>
              <td>
                <span className="font-semibold text-pink-400">
                  {formatUsd(token.totalPrice)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}