import { getTransactionWithReceipt } from '@/lib/rpc'

interface TxPageProps {
  params: { hash: string }
}

export default async function TxPage({ params }: TxPageProps) {
  const { tx, receipt } = await getTransactionWithReceipt(params.hash)

  if (!tx) {
    return <div className="p-6">Transaction not found.</div>
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transaction Detail</h1>
      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <p><strong>Hash:</strong> {tx.hash}</p>
        <p><strong>Status:</strong> {receipt.status === 1 ? '✅ Success' : '❌ Failed'}</p>
        <p><strong>Block:</strong> <a href={`/block/${tx.blockNumber}`} className="text-blue-600 underline">#{tx.blockNumber}</a></p>
        <p><strong>From:</strong> <a href={`/address/${tx.from}`} className="text-blue-600 underline">{tx.from}</a></p>
        <p><strong>To:</strong> <a href={`/address/${tx.to}`} className="text-blue-600 underline">{tx.to}</a></p>
        <p><strong>Value:</strong> {Number(tx.value) / 1e18} ETH</p>
        <p><strong>Gas Used:</strong> {receipt.gasUsed.toString()}</p>
        <p><strong>Gas Price:</strong> {tx.gasPrice?.toString()} wei</p>
        <p><strong>Nonce:</strong> {tx.nonce}</p>
        <p><strong>Input:</strong> <code className="break-all block">{tx.data}</code></p>
      </div>
    </main>
  )
}
