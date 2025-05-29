'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import './StorageNavbar.css'

export default function StorageNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hoverMenu, setHoverMenu] = useState<string | null>(null)
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
    <nav className="storage-navbar">
      <div className="storage-navbar-container">
        <div className="header-top">
          <Link href="/" className="header-logo">
            <Image src="/0g-logos.png" alt="OG Logo" width={40} height={40} />
            <span>OG Explorer</span>
          </Link>
          <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="header-search">
          <Search className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search block / tx hash / address"
          />
        </form>

        <div className="nav-links">
          <div
            className="nav-link-with-submenu"
            onMouseEnter={() => setHoverMenu('blockchain')}
            onMouseLeave={() => setHoverMenu(null)}
          >
            <span className="nav-link">
              Blockchain <ChevronDown size={14} />
            </span>
            <div className={`submenu ${hoverMenu === 'blockchain' ? 'visible' : ''}`}>
              <div className="submenu-column">
                <div className="submenu-header">Blockchain</div>
                <Link href="/blocks" className="submenu-link">Blocks</Link>
                <Link href="/transactions" className="submenu-link">Transactions</Link>
              </div>
              <div className="submenu-column">
                <div className="submenu-header">Contract</div>
                <Link href="/contract/deploy" className="submenu-link">Contract Deployment</Link>
                <Link href="/contract/verify" className="submenu-link">Contract Verification</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sidebar">
          <button className="close-btn" onClick={() => setIsOpen(false)}><X /></button>
          <div className="sidebar-section">
            <span className="sidebar-label">Blockchain</span>
            <Link href="/blocks" className="sidebar-link" onClick={() => setIsOpen(false)}>Blocks</Link>
            <Link href="/transactions" className="sidebar-link" onClick={() => setIsOpen(false)}>Transactions</Link>
            <span className="sidebar-label">Contract</span>
            <Link href="/contract/deploy" className="sidebar-link" onClick={() => setIsOpen(false)}>Contract Deployment</Link>
            <Link href="/contract/verify" className="sidebar-link" onClick={() => setIsOpen(false)}>Contract Verification</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
