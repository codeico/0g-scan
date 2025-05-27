'use client'

import { useState } from 'react'
import BlockTable from './BlockTable'
import TransactionTable from './TransactionTable'

export default function BlockAndTransactionTabs() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'transactions'>('blocks')

  return (
    <section className="tab-section">
      {/* Tabs Header */}
      <div className="tab-header">
        <button
          className={`tab-button ${activeTab === 'blocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocks')}
        >
          Latest Blocks
        </button>
        <button
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Latest Transactions
        </button>
      </div>

      {/* Tab Content */}
        {activeTab === 'blocks' ? <BlockTable /> : <TransactionTable />}
    </section>
  )
}
