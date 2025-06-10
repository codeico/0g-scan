'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronDown, Search, Copy, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  walletAddress?: string
}

export default function Header({ walletAddress }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [hoverMenu, setHoverMenu] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.mobile-sidebar')
      const menuToggle = document.querySelector('.menu-toggle')
      
      if (sidebar && !sidebar.contains(event.target as Node) && 
          menuToggle && !menuToggle.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = search.trim()
    
    if (!input) return

    setIsSearching(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (/^\d+$/.test(input)) {
        router.push(`/block/${input}`)
      } else if (/^0x[a-fA-F0-9]{64}$/.test(input)) {
        router.push(`/tx/${input}`)
      } else if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
        router.push(`/address/${input}`)
      } else {
        showNotification('Input format not recognized. Please enter a valid block number, transaction hash, or address.', 'error')
      }
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      showNotification('Address copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showNotification('Failed to copy address', 'error')
    }    
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `toast-notification toast-${type}`
    toast.textContent = message
    
    const styles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-pink)',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: '10000',
      animation: 'slideInRight 0.3s ease-out',
      maxWidth: '320px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
    
    Object.assign(toast.style, styles)
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  const formatWalletAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <>
      <header className="modern-header">
        <div className="header-content">
          {/* Logo Section */}
          <Link href="/" className="logo-section">
            <div className="logo-container">
              <Image 
                src="/0g-logos.png" 
                alt="OG Logo" 
                width={40} 
                height={40}
                className="logo-image"
                priority
              />
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-section">
            <div className={`search-container ${isSearching ? 'searching' : ''}`}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blocks, transactions, addresses..."
                disabled={isSearching}
                className="search-input"
              />
              {isSearching && <div className="search-loader"></div>}
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <div
              className="nav-dropdown"
              onMouseEnter={() => setHoverMenu('storage')}
              onMouseLeave={() => setHoverMenu(null)}
            >
              <button className="nav-button">
                <span>Storage Scan</span>
                <ChevronDown size={16} className={`chevron ${hoverMenu === 'storage' ? 'rotate' : ''}`} />
              </button>
              
              <div className={`dropdown-menu ${hoverMenu === 'storage' ? 'show' : ''}`}>
                <div className="dropdown-content">
                  <div className="dropdown-header">Storage Scan</div>
                  <Link href="/miner/rank" className="dropdown-link">
                    <span>Top Miner</span>
                  </Link>
                  <Link href="/miner/list" className="dropdown-link">
                    <span>Miner List</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Wallet Address Display */}
            {walletAddress && (
              <div className="wallet-display">
                <button 
                  onClick={() => copyToClipboard(walletAddress)}
                  className="wallet-button"
                  title="Click to copy full address"
                >
                  <span className="wallet-address">{formatWalletAddress(walletAddress)}</span>
                  <div className="wallet-icon">
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            <div className={`hamburger ${isOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Search (appears below header on mobile) */}
        <div className="mobile-search">
          <form onSubmit={handleSearch}>
            <div className={`search-container ${isSearching ? 'searching' : ''}`}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blocks, transactions, addresses..."
                disabled={isSearching}
                className="search-input"
              />
              {isSearching && <div className="search-loader"></div>}
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
          <div className="mobile-sidebar">
            <div className="sidebar-header">
              <h3>Navigation</h3>
              <button 
                className="close-button" 
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="sidebar-content">
              <div className="sidebar-section">
                <div className="section-label">Storage Scan</div>
                <Link 
                  href="/miner/rank" 
                  className="sidebar-link" 
                  onClick={() => setIsOpen(false)}
                >
                  <span>Top Miner</span>
                </Link>
                <Link 
                  href="/miner/list" 
                  className="sidebar-link" 
                  onClick={() => setIsOpen(false)}
                >
                  <span>Miner List</span>
                </Link>
              </div>

              {walletAddress && (
                <div className="sidebar-section">
                  <div className="section-label">Wallet</div>
                  <button 
                    className="wallet-sidebar-button"
                    onClick={() => copyToClipboard(walletAddress)}
                  >
                    <span className="wallet-address">{formatWalletAddress(walletAddress)}</span>
                    <div className="wallet-icon">
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* === MODERN HEADER STYLES === */
        .modern-header {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-primary);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--gradient-primary);
          opacity: 0.6;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        /* === LOGO SECTION === */
        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.125rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          flex-shrink: 0;
        }

        .logo-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .logo-image {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .logo-text {
          background: var(--gradient-primary);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        .logo-section:hover .logo-container {
          transform: scale(1.05);
          box-shadow: var(--shadow-glow);
        }

        .logo-section:hover {
          transform: translateY(-1px);
        }

        /* === SEARCH SECTION === */
        .search-section {
          flex: 1;
          max-width: 600px;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1.25rem 0.875rem 3.25rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', sans-serif;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
          background: var(--bg-card);
          transform: translateY(-1px);
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 1.125rem;
          transform: translateY(-50%);
          color: var(--text-muted);
          transition: color 0.3s ease;
          pointer-events: none;
        }

        .search-container:focus-within .search-icon {
          color: var(--accent-blue);
        }

        .search-loader {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-primary);
          border-top: 2px solid var(--accent-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }

        /* === DESKTOP NAVIGATION === */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-dropdown {
          position: relative;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-accent);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-button:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .chevron {
          transition: transform 0.3s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          padding: 1rem;
          min-width: 220px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-header {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border-primary);
          padding-bottom: 0.5rem;
        }

        .dropdown-link {
          display: block;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          margin-bottom: 0.25rem;
        }

        .dropdown-link:hover {
          color: var(--text-primary);
          background: rgba(88, 166, 255, 0.1);
          transform: translateX(4px);
        }

        /* === WALLET DISPLAY === */
        .wallet-display {
          flex-shrink: 0;
        }

        .wallet-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-accent);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wallet-button:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .wallet-address {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .wallet-icon {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          transition: color 0.3s ease;
        }

        .wallet-button:hover .wallet-icon {
          color: var(--accent-blue);
        }

        /* === MOBILE TOGGLE === */
        .mobile-toggle {
          display: none;
          background: var(--bg-accent);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .mobile-toggle:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
        }

        .hamburger {
          position: relative;
          width: 20px;
          height: 14px;
        }

        .hamburger span {
          position: absolute;
          width: 100%;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 1px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger span:nth-child(1) { top: 0; }
        .hamburger span:nth-child(2) { top: 50%; transform: translateY(-50%); }
        .hamburger span:nth-child(3) { bottom: 0; }

        .hamburger.active span:nth-child(1) {
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          bottom: 50%;
          transform: translateY(50%) rotate(-45deg);
        }

        /* === MOBILE SEARCH === */
        .mobile-search {
          display: none;
          padding: 1rem 2rem;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        /* === MOBILE SIDEBAR === */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 999;
          animation: fadeIn 0.3s ease-out;
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 320px;
          max-width: 90vw;
          background: var(--bg-card);
          border-left: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-accent);
        }

        .sidebar-header h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .close-button {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--accent-blue);
        }

        .sidebar-content {
          padding: 1.5rem;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .section-label {
          display: block;
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .sidebar-link {
          display: block;
          color: var(--text-secondary);
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          margin-bottom: 0.5rem;
          border: 1px solid transparent;
        }

        .sidebar-link:hover {
          color: var(--text-primary);
          background: rgba(88, 166, 255, 0.1);
          border-color: rgba(88, 166, 255, 0.2);
          transform: translateX(4px);
        }

        .wallet-sidebar-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-accent);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 0.875rem 1.25rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wallet-sidebar-button:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
          border-color: var(--accent-blue);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        /* === RESPONSIVE DESIGN === */
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none;
          }

          .mobile-toggle {
            display: block;
          }

          .search-section {
            display: none;
          }

          .mobile-search {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
            gap: 1rem;
          }

          .logo-section {
            font-size: 1rem;
          }

          .logo-image {
            width: 32px;
            height: 32px;
          }

          .mobile-search {
            padding: 1rem;
          }

          .search-input {
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            font-size: 0.875rem;
          }

          .search-icon {
            left: 1rem;
            width: 16px;
            height: 16px;
          }
        }

        /* === ANIMATIONS === */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}