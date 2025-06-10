'use client'

import NetworkStats from '@/components/NetworkStats'
import ChartSection from '@/components/ChartSection'
import BlockAndTransactionTabs from '@/components/BlockAndTransactionTabs'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#111318] to-[#0a0b0d] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}

      {/* Main Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 space-y-16 pb-16">
        {/* Network Stats Section */}
        <section className="fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Network Overview</h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Real-time metrics and statistics from the 0G blockchain network
            </p>
          </div>
          <NetworkStats />
        </section>

        {/* Charts Section */}
        <section className="slide-in-right">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-secondary mb-4">Network Analytics</h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Comprehensive charts and data visualization for network activity
            </p>
          </div>
          <ChartSection />
        </section>

        {/* Blocks & Transactions Section */}
        <section className="fade-in-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Latest Activity</h2>
            <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
              Browse the most recent blocks and transactions on the network
            </p>
          </div>
          <BlockAndTransactionTabs />
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#30363d] bg-[#161b22]/80 backdrop-blur-sm mt-20">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center gap-6 text-sm text-[#656d76]">
              <div className="text-2xl font-bold text-gradient mb-4">0G Network Explorer</div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}