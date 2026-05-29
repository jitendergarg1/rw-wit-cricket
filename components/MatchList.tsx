'use client'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { Event, Member } from '@/lib/types'
import { useAdmin } from '@/hooks/useAdmin'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AttendancePanel from './AttendancePanel'
import AssignmentPanel from './AssignmentPanel'

interface Props {
  matches: Event[]
  members: Member[]
}

export default function MatchList({ matches, members }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { isAdmin } = useAdmin()
  const router = useRouter()

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function deleteMatch(id: string) {
    if (!confirm('Delete this match?')) return
    await createClient().from('events').delete().eq('id', id)
    router.refresh()
  }

  if (!matches.length) return <p className="text-gray-400 text-center py-16">No matches scheduled.</p>

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.id} className="bg-white rounded-xl shadow border border-gray-100">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleExpand(match.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-center bg-green-50 rounded-lg px-3 py-1 min-w-[52px]">
                <div className="text-xs text-green-500 font-medium uppercase">{format(parseISO(match.date), 'MMM')}</div>
                <div className="text-xl font-bold text-green-700 leading-tight">{format(parseISO(match.date), 'd')}</div>
                <div className="text-xs text-green-400">{format(parseISO(match.date), 'EEE')}</div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{match.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={12} />{match.time.slice(0, 5)}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{match.location}</span>
                </div>
                {match.notes && <p className="text-xs text-gray-400 mt-1">{match.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMatch(match.id) }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              )}
              {expanded.has(match.id) ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </div>

          {expanded.has(match.id) && (
            <div className="border-t border-gray-100 p-4 grid sm:grid-cols-2 gap-4">
              <AttendancePanel eventId={match.id} members={members} />
              <AssignmentPanel eventId={match.id} members={members} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
