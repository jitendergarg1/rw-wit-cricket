'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Event, Member } from '@/lib/types'

interface Props {
  trainings: Event[]
  members: Member[]
}

export default function TrainingList({ trainings, members }: Props) {
  const [absentMap, setAbsentMap] = useState<Record<string, Set<string>>>({})

  useEffect(() => {
    const supabase = createClient()
    const ids = trainings.map((t) => t.id)
    if (!ids.length) return
    supabase
      .from('attendance')
      .select('event_id, member_id')
      .in('event_id', ids)
      .eq('status', 'not_attending')
      .then(({ data }) => {
        const map: Record<string, Set<string>> = {}
        data?.forEach(({ event_id, member_id }) => {
          if (!map[event_id]) map[event_id] = new Set()
          map[event_id].add(member_id)
        })
        setAbsentMap(map)
      })
  }, [trainings])

  async function toggleAbsent(eventId: string, memberId: string) {
    const supabase = createClient()
    const absent = absentMap[eventId]?.has(memberId)
    if (absent) {
      await supabase.from('attendance').delete().eq('event_id', eventId).eq('member_id', memberId)
      setAbsentMap((prev) => {
        const next = { ...prev }
        next[eventId] = new Set(next[eventId])
        next[eventId].delete(memberId)
        return next
      })
    } else {
      await supabase.from('attendance').upsert(
        { event_id: eventId, member_id: memberId, status: 'not_attending' },
        { onConflict: 'event_id,member_id' }
      )
      setAbsentMap((prev) => ({
        ...prev,
        [eventId]: new Set([...(prev[eventId] ?? []), memberId]),
      }))
    }
  }

  if (!trainings.length) return <p className="text-gray-400 text-center py-16">No upcoming trainings.</p>

  return (
    <div className="space-y-4">
      {trainings.map((t) => {
        const absent = absentMap[t.id] ?? new Set()
        const absentCount = absent.size
        return (
          <div key={t.id} className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-center bg-blue-50 rounded-lg px-3 py-1 min-w-[52px]">
                <div className="text-xs text-blue-500 font-medium uppercase">{format(parseISO(t.date), 'MMM')}</div>
                <div className="text-xl font-bold text-blue-700 leading-tight">{format(parseISO(t.date), 'd')}</div>
                <div className="text-xs text-blue-400">{format(parseISO(t.date), 'EEE')}</div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{t.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={12} />16:30 – 18:00</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{t.location}</span>
                </div>
                {absentCount > 0 && (
                  <p className="text-xs text-red-500 mt-1">{absentCount} player{absentCount > 1 ? 's' : ''} can&apos;t make it</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((m) => {
                const isAbsent = absent.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleAbsent(t.id, m.id)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      isAbsent
                        ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block truncate">{m.first_name} {m.last_name}</span>
                    <span className="text-xs">{isAbsent ? "❌ Can't make it" : '✓ Available'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
