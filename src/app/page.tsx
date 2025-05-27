'use client'

import NetworkStats from '@/components/NetworkStats'
import ChartSection from '@/components/ChartSection'
import BlockAndTransactionTabs from '@/components/BlockAndTransactionTabs'

export default function HomePage() {
  return (
    <main className="bg-[#0d1117] text-[#e6edf3] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        <section className="section">
          <NetworkStats />
        </section>

        <section className="section">
          <ChartSection />
        </section>

        <section className="section">
          <BlockAndTransactionTabs />
        </section>
      </div>

    </main>
  )
}
