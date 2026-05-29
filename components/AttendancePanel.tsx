'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Member, Attendance } from '@/lib/types'
import { Check, X, HelpCircle } from 'lucide-react'

interface Props {
  eventId: string
  members: Member[]
}

const STATUS_CONFIG = {
  attending: { label: 'Yes', icon: Check, color: 'bg-green-100 text-green-700 border-green-300' },
  not_attending: { label: 'No', icon: X, color: 'bg-red-100 text-red-600 border-red-300' },
  maybe: { label: 'Maybe', icon: HelpCircle, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
}

export default function AttendancePanel({ eventId, members }: Props) {
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('attendance')
      .select('*')
      .eq('event_id', eventId)
      .then(({ data }) => {
        const map: Record<string, string> = {}
        ;(data as Attendance[])?.forEach((a) => { map[a.member_id] = a.status })
        setAttendance(map)
      })
  }, [eventId])

  async function toggle(memberId: string, status: string) {
    const current = attendance[memberId]
    if (current === status) {
      await supabase.from('attendance').delete().eq('event_id', eventId).eq('member_id', memberId)
      setAttendance((prev) => { const n = { ...prev }; delete n[memberId]; return n })
    } else {
      await supabase.from('attendance').upsert({ event_id: eventId, member_id: memberId, status }, { onConflict: 'event_id,member_id' })
      setAttendance((prev) => ({ ...prev, [memberId]: status }))
    }
  }

  const attending = members.filter((m) => attendance[m.id] === 'attending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Attendance</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          {attending} / {members.length} coming
        </span>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate max-w-[120px]">{member.name}</span>
            <div className="flex gap-1">
              {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([status, cfg]) => {
                const Icon = cfg.icon
                const active = attendance[member.id] === status
                return (
                  <button
                    key={status}
                    onClick={() => toggle(member.id, status)}
                    title={cfg.label}
                    className={`rounded border px-1.5 py-0.5 text-xs flex items-center gap-0.5 transition-colors ${
                      active ? cfg.color : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={11} />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
