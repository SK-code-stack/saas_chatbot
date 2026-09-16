import React, { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Settings() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'team' | 'domain' | 'security'

  const [profile, setProfile] = useState({
    firstName: user?.first_name || 'Admin',
    lastName: user?.last_name || 'User',
    email: user?.email || 'admin@acme.org',
    timezone: 'UTC-5 (Eastern Time)',
  })

  const [customDomain, setCustomDomain] = useState('chat.acme.org')
  const [teamMembers] = useState([
    { name: 'Jane Doe', email: 'jane@acme.org', role: 'Owner', status: 'Active' },
    { name: 'Alex Smith', email: 'alex@acme.org', role: 'Developer', status: 'Active' },
    { name: 'Support Bot Admin', email: 'bot_admin@acme.org', role: 'Viewer', status: 'Invited' },
  ])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    toast.success('Profile settings updated successfully!')
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Account & Workspace Settings" />

        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
          {/* Header Bar */}
          <div className="border-b border-[#2d3449] pb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Workspace Settings</h1>
            <p className="text-xs md:text-sm text-[#908fa0]">Manage account profile, team access permissions, and custom domain setup.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-[#2d3449] pb-3 overflow-x-auto text-xs sm:text-sm">
            {[
              { id: 'profile', name: 'Profile Information', icon: 'person' },
              { id: 'team', name: 'Team Members & Roles', icon: 'group' },
              { id: 'domain', name: 'Custom Domain', icon: 'language' },
              { id: 'security', name: 'Security & 2FA', icon: 'shield' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#6366f1] text-white font-semibold shadow-md'
                    : 'text-[#908fa0] hover:text-white hover:bg-[#171f33]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 max-w-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-[#2d3449] pb-3">Personal Profile</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#c7c4d7]">First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full bg-[#131b2e] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d3449] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#c7c4d7]">Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full bg-[#131b2e] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d3449] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c7c4d7]">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-[#131b2e]/60 text-[#908fa0] text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d3449] cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6366f1] text-white font-semibold text-xs sm:text-sm hover:bg-[#4f46e5] transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Team Members */}
          {activeTab === 'team' && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2d3449] pb-4">
                <h2 className="text-base font-bold text-white">Team Members ({teamMembers.length})</h2>
                <button
                  onClick={() => toast.success('Invite link sent!')}
                  className="px-4 py-2 rounded-xl bg-[#6366f1] text-white text-xs font-semibold"
                >
                  + Invite Teammate
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#908fa0] uppercase tracking-wider font-mono border-b border-[#2d3449]/50">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d3449]/30 text-[#dae2fd]">
                    {teamMembers.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#222a3d]/40 transition-colors">
                        <td className="py-3.5">
                          <p className="font-semibold text-white">{m.name}</p>
                          <p className="text-[11px] text-[#908fa0]">{m.email}</p>
                        </td>
                        <td className="py-3.5 font-mono text-[#38bdf8]">{m.role}</td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#10b981]/20 text-[#10b981]">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Custom Domain */}
          {activeTab === 'domain' && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 max-w-2xl space-y-6">
              <div className="border-b border-[#2d3449] pb-3">
                <h2 className="text-base font-bold text-white">Custom Domain Mapping</h2>
                <p className="text-xs text-[#908fa0]">Serve your AI chatbot widget from your own domain name</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c7c4d7]">Custom Domain Name</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="chat.yourdomain.com"
                    className="w-full bg-[#131b2e] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d3449] outline-none"
                  />
                </div>

                <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-4 space-y-2 text-xs font-mono text-[#c7c4d7]">
                  <p className="text-white font-bold">DNS CNAME Record to add to your DNS provider:</p>
                  <div className="flex justify-between text-[#38bdf8]">
                    <span>Type: CNAME</span>
                    <span>Host: chat</span>
                    <span>Target: cname.chatti.ai</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('CNAME Verification check initiated')}
                  className="px-6 py-2.5 rounded-xl bg-[#38bdf8] text-[#00354a] font-semibold text-xs sm:text-sm"
                >
                  Verify DNS CNAME Record
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Security */}
          {activeTab === 'security' && (
            <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl p-6 max-w-2xl space-y-6">
              <div className="border-b border-[#2d3449] pb-3">
                <h2 className="text-base font-bold text-white">Security & Two-Factor Authentication</h2>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#131b2e] border border-[#2d3449] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-[#908fa0]">Protect your account with Google Authenticator or TOTP apps</p>
                </div>
                <button
                  onClick={() => toast.success('2FA Setup modal launched')}
                  className="px-4 py-2 rounded-xl bg-[#10b981] text-white text-xs font-semibold"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
