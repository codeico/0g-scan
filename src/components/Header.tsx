'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Link from 'next/link'
import './Header.css' // Import style

export default function Header() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const input = search.trim()
    if (/^\d+$/.test(input)) {
      router.push(`/block/${input}`)
    } else if (/^0x[a-fA-F0-9]{64}$/.test(input)) {
      router.push(`/tx/${input}`)
    } else if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
      router.push(`/address/${input}`)
    } else {
      alert('Input not recognized')
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <img src="/0g-logos.png" alt="OG Logo" />
          <span>OG Explorer</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="header-search">
          <Search className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search block / tx hash / address"
          />
        </form>

        {/* Wallet (example) */}
        <div className="header-wallet">
          <span>0xe6F5...4DBd</span>
        </div>
      </div>
    </header>
  )
}
