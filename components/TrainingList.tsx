'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, XCircle, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Event, Member } from '@/lib/types'

interface Props {
  trainings: Event[]
  members: Member[]
}

export default function TrainingList({ trainings, members }: Props) {
  const [absentMap, setAbsentMap] = useState<Record<string, Set<string>>>({})
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(
    new Set(trainings.filter((t) => t.cancelled).map((t) => t.id))
  )

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

  async function toggleCancel(eventId: string) {
    const isCancelled = cancelledIds.has(eventId)
    if (!confirm(isCancelled ? 'Restore this training?' : 'Cancel this training?')) return
    await createClient().from('events').update({ cancelled: !isCancelled }).eq('id', eventId)
    setCancelledIds((prev) => {
      const next = new Set(prev)
      isCancelled ? next.delete(eventId) : next.add(eventId)
      return next
    })
  }

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
        const isCancelled = cancelledIds.has(t.id)
        const absent = absentMap[t.id] ?? new Set()
        const absentCount = absent.size

        return (
          <div key={t.id} className={`rounded-xl shadow border p-4 ${isCancelled ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100'}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`text-center rounded-lg px-3 py-1 min-w-[52px] ${isCancelled ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <div className={`text-xs font-medium uppercase ${isCancelled ? 'text-gray-400' : 'text-blue-500'}`}>{format(parseISO(t.date), 'MMM')}</div>
                <div className={`text-xl font-bold leading-tight ${isCancelled ? 'text-gray-400 line-through' : 'text-blue-700'}`}>{format(parseISO(t.date), 'd')}</div>
                <div className={`text-xs ${isCancelled ? 'text-gray-400' : 'text-blue-400'}`}>{format(parseISO(t.date), 'EEE')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.title}</p>
                    {isCancelled && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Cancelled</span>}
                    {!isCancelled && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={12} />16:30 – 18:00</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{t.location}</span>
                      </div>
                    )}
                    {!isCancelled && absentCount > 0 && (
                      <p className="text-xs text-red-500 mt-1">{absentCount} player{absentCount > 1 ? 's' : ''} can&apos;t make it</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleCancel(t.id)}
                    title={isCancelled ? 'Restore training' : 'Cancel training'}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ml-2 ${
                      isCancelled
                        ? 'border-green-300 text-green-600 hover:bg-green-50'
                        : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    {isCancelled ? <><RotateCcw size={12} /> Restore</> : <><XCircle size={12} /> Cancel</>}
                  </button>
                </div>
              </div>
            </div>

            {!isCancelled && (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
