'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Member } from '@/lib/types'
import { UserPlus, Trash2, Phone, Mail } from 'lucide-react'

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
          <UserPlus size={16} /> Add Member
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow p-4 border border-gray-100 grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input name="name" required placeholder="Full name" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input name="email" type="email" required placeholder="email@example.com" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
            <input name="phone" placeholder="04xx xxx xxx" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
          </div>
          <div className="sm:col-span-3 flex gap-2 justify-end">
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
            <div>
              <p className="font-semibold text-gray-800">{m.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Mail size={11} /> {m.email}
              </div>
              {m.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Phone size={11} /> {m.phone}
                </div>
              )}
            </div>
            <button onClick={() => deleteMember(m.id)} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-gray-400 text-sm sm:col-span-2 text-center py-12">No members yet. Add your first one above.</p>
        )}
      </div>
    </div>
  )
}
