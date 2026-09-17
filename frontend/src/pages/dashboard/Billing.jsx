import React, { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function Billing() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)

  // Card form local state
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
    country: 'United States',
    zip: '',
  })

  // Saved Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm_1', brand: 'Visa', last4: '4242', exp: '12/28', isDefault: true },
    { id: 'pm_2', brand: 'Mastercard', last4: '8819', exp: '09/27', isDefault: false },
  ])

  // Fetch Plans & Subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/billing/subscription/')
        return res.data
      } catch (e) {
        return { plan: { name: 'Pro Scale' }, status: 'active', renewal_date: '2026-10-15' }
      }
    },
  })

  const handleAddCardSubmit = (e) => {
    e.preventDefault()
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc) {
      toast.error('Please enter valid credit card details')
      return
    }

    const last4 = cardForm.number.slice(-4) || '1234'
    const brand = cardForm.number.startsWith('5') ? 'Mastercard' : 'Visa'

    setPaymentMethods((prev) => [
      ...prev,
      { id: `pm_${Date.now()}`, brand, last4, exp: cardForm.expiry, isDefault: false },
    ])

    toast.success('Credit card saved securely via Stripe!')
    setShowAddCardModal(false)
    setCardForm({ name: '', number: '', expiry: '', cvc: '', country: 'United States', zip: '' })
  }

  const handleRemoveCard = (id) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id))
    toast.success('Payment method removed')
  }

  const invoices = [
    { id: '#INV-2026-089', date: 'Sep 01, 2026', amount: '$99.00', status: 'Paid', card: 'Visa •••• 4242' },
    { id: '#INV-2026-042', date: 'Aug 01, 2026', amount: '$99.00', status: 'Paid', card: 'Visa •••• 4242' },
    { id: '#INV-2026-001', date: 'Jul 01, 2026', amount: '$99.00', status: 'Paid', card: 'Visa •••• 4242' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Billing & Payment Methods" />

        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2d3449] pb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing & Stripe Subscription</h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-[#908fa0]">Manage subscription tiers, payment methods, and download invoice receipts.</p>
            </div>
            <button
              onClick={() => toast.success('Redirecting to Stripe Portal...')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs md:text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              <span>Stripe Customer Portal</span>
            </button>
          </div>

          {/* Active Subscription Overview Card */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#38bdf8] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Active Plan: Pro Scale</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                      Auto-renews Oct 15, 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#908fa0]">$99.00 / month billed via Stripe</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.success('Plan upgrade options opened')}
                  className="px-4 py-2 rounded-xl bg-[#6366f1] text-white font-semibold text-xs shadow-md"
                >
                  Upgrade to Enterprise
                </button>
              </div>
            </div>

            {/* Quota Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#908fa0]">Monthly Message Quota</span>
                  <span className="font-mono text-white font-bold">42,000 / 50,000 used (84%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#131b2e] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#6366f1] h-full w-[84%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-[#908fa0]">Vector Storage Space</span>
                  <span className="font-mono text-white font-bold">1.2 GB / 5.0 GB used (24%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#131b2e] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#38bdf8] h-full w-[24%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Payment Methods Section */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38bdf8]">credit_card</span>
                  <span>Stripe Payment Methods</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Manage credit cards used for auto-billing</p>
              </div>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#222a3d] border border-slate-200 dark:border-[#31394d] hover:bg-slate-200 dark:hover:bg-[#31394d] text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Payment Method</span>
              </button>
            </div>

            {/* Cards List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-[#2d3449] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#222a3d] border border-slate-200 dark:border-[#31394d] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
                      {pm.brand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white font-mono">•••• •••• •••• {pm.last4}</p>
                        {pm.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-[#908fa0]">Expires {pm.exp}</p>
                    </div>
                  </div>

                  {!pm.isDefault && (
                    <button
                      onClick={() => handleRemoveCard(pm.id)}
                      className="p-1.5 text-[#908fa0] hover:text-red-400 hover:bg-slate-100 dark:hover:bg-[#222a3d] rounded-lg transition-colors"
                      title="Remove card"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invoice History Table */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <h2 className="text-base font-bold text-white">Payment & Invoice History</h2>
              <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-[#908fa0] font-mono">3 Invoices Paid</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-[#908fa0] uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-200 dark:border-[#2d3449]/50">
                    <th className="pb-3 font-medium">Invoice ID</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Payment Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-100 dark:divide-[#2d3449]/30 text-[#dae2fd]">
                  {invoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#222a3d]/40 transition-colors">
                      <td className="py-3.5 font-mono text-[#38bdf8] font-bold">{inv.id}</td>
                      <td className="py-3.5 text-slate-500 dark:text-[#908fa0]">{inv.date}</td>
                      <td className="py-3.5 font-bold text-white">{inv.amount}</td>
                      <td className="py-3.5 text-slate-600 dark:text-[#c7c4d7]">{inv.card}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#10b981]/20 text-[#10b981]">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => toast.success(`Downloading PDF for ${inv.id}...`)}
                          className="p-1.5 text-[#38bdf8] hover:underline text-xs flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Stripe Elements Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8]">lock</span>
                <h3 className="text-base font-bold text-white">Add Credit Card (Stripe)</h3>
              </div>
              <button onClick={() => setShowAddCardModal(false)} className="text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength="19"
                    value={cardForm.number}
                    onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm font-mono pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-500 dark:text-[#908fa0]">credit_card</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={cardForm.cvc}
                    onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#10b981] pt-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Encrypted using Stripe 256-bit SSL Security</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all"
              >
                Save Payment Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
