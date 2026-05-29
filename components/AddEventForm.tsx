'use client'
import { useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'

export default function AddEventForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAdmin } = useAdmin()
  const router = useRouter()

  if (!isAdmin) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const supabase = createClient()
    await supabase.from('events').insert([data])
    form.reset()
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
      >
        <PlusCircle size={16} /> Add Training / Match
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">New Event</h2>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input name="title" required placeholder="e.g. Training vs Redbacks" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select name="type" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
            <option value="training">Training</option>
            <option value="match">Match</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input name="date" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
          <input name="time" type="time" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
          <input name="location" required placeholder="e.g. Oval Park, Pitch 2" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
          <input name="notes" placeholder="Any extra info" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 text-sm font-medium disabled:opacity-50">
            {loading ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
