'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Member } from '@/lib/types'
import { UserPlus, Trash2, Phone, Users } from 'lucide-react'

interface Props { members: Member[] }

export default function MemberList({ members }: Props) {
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const supabase = createClient()
    await supabase.from('members').insert([data])
    setAdding(false)
    setLoading(false)
    router.refresh()
  }

  async function deleteMember(id: string) {
    if (!confirm('Remove this member?')) return
    const supabase = createClient()
    await supabase.from('members').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 text-sm font-medium"
        >
          <UserPlus size={16} /> Add Player
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow p-4 border border-gray-100 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm">Player details</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input name="first_name" required placeholder="First name" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input name="last_name" required placeholder="Last name" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Player Phone (optional)</label>
              <input name="phone" placeholder="06xx xxx xxx" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-700 text-sm pt-1">Parent / Guardian</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parent Name</label>
              <input name="parent_name" placeholder="Parent full name" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parent Phone</label>
              <input name="parent_phone" placeholder="06xx xxx xxx" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 text-sm font-medium disabled:opacity-50">
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">{m.first_name} {m.last_name}</p>
              {m.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={11} /> {m.phone}
                </div>
              )}
              {m.parent_name && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Users size={11} />
                  <span className="font-medium text-gray-600">{m.parent_name}</span>
                  {m.parent_phone && <span>· {m.parent_phone}</span>}
                </div>
              )}
            </div>
            <button onClick={() => deleteMember(m.id)} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-gray-400 text-sm sm:col-span-2 text-center py-12">No members yet.</p>
        )}
      </div>
    </div>
  )
}
