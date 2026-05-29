'use client'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { MapPin, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { Event, Member } from '@/lib/types'
import AttendancePanel from './AttendancePanel'
import AssignmentPanel from './AssignmentPanel'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  events: Event[]
  members: Member[]
}

const TYPE_COLORS: Record<string, string> = {
  training: 'bg-blue-100 text-blue-700',
  match: 'bg-green-100 text-green-700',
}

export default function EventList({ events, members }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const router = useRouter()

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        No events yet. Add a training or match above.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-xl shadow border border-gray-100">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setExpanded(expanded === event.id ? null : event.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-center bg-red-50 rounded-lg px-3 py-1 min-w-[52px]">
                <div className="text-xs text-red-500 font-medium uppercase">
                  {format(parseISO(event.date), 'MMM')}
                </div>
                <div className="text-xl font-bold text-red-700 leading-tight">
                  {format(parseISO(event.date), 'd')}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{event.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[event.type]}`}>
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={12} />{event.time.slice(0, 5)}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
                </div>
                {event.notes && <p className="text-xs text-gray-400 mt-1">{event.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); deleteEvent(event.id) }}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={15} />
              </button>
              {expanded === event.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </div>

          {expanded === event.id && (
            <div className="border-t border-gray-100 p-4 grid sm:grid-cols-2 gap-4">
              <AttendancePanel eventId={event.id} members={members} />
              <AssignmentPanel eventId={event.id} members={members} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
