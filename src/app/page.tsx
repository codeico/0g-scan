'use client'

import NetworkStats from '@/components/NetworkStats'
import ChartSection from '@/components/ChartSection'
import BlockAndTransactionTabs from '@/components/BlockAndTransactionTabs'

export default function HomePage() {
  return (
    <main className="bg-[#0d1117] text-[#e6edf3] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

        {/* Network Stats */}
        <section className="section">
          <NetworkStats />
        </section>

        {/* Chart Section */}
        <section className="section">
          <ChartSection />
        </section>

        {/* Block & Transaction Tabs */}
        <section className="section">
          <BlockAndTransactionTabs />
        </section>

      </div>
    </main>
  )
}
