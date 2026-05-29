'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Member, Assignment } from '@/lib/types'
import { Plus, X } from 'lucide-react'

interface Props {
  eventId: string
  members: Member[]
}

const PRESET_ROLES = ['Umpire', 'Lunch Provider', 'Scorer', 'Team Coach', 'Carpool']

export default function AssignmentPanel({ eventId, members }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedPerson, setSelectedPerson] = useState('')
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0])
  const [customRole, setCustomRole] = useState('')
  const supabase = createClient()

  // Build a flat list of assignable people: parents first, then players without parents
  const people: { id: string; label: string; isParent: boolean }[] = []
  members.forEach((m) => {
    if (m.parent_name) {
      people.push({ id: `parent:${m.id}`, label: `${m.parent_name} (parent of ${m.first_name})`, isParent: true })
    }
  })
  members.forEach((m) => {
    people.push({ id: `player:${m.id}`, label: `${m.first_name} ${m.last_name}`, isParent: false })
  })

  useEffect(() => {
    supabase
      .from('assignments')
      .select('*, member:members(id, first_name, last_name, parent_name)')
      .eq('event_id', eventId)
      .then(({ data }) => setAssignments((data as Assignment[]) ?? []))
  }, [eventId])

  async function addAssignment() {
    if (!selectedPerson) return
    const role = selectedRole === 'Custom' ? customRole.trim() : selectedRole
    if (!role) return

    const isParent = selectedPerson.startsWith('parent:')
    const memberId = selectedPerson.replace(/^(parent:|player:)/, '')
    const person = people.find((p) => p.id === selectedPerson)
    const displayName = person?.label ?? ''

    const { data } = await supabase
      .from('assignments')
      .insert({ event_id: eventId, member_id: memberId, role, display_name: displayName, is_parent: isParent })
      .select('*, member:members(id, first_name, last_name, parent_name)')
      .single()
    if (data) setAssignments((prev) => [...prev, data as Assignment])
    setSelectedPerson('')
    setCustomRole('')
  }

  async function removeAssignment(id: string) {
    await supabase.from('assignments').delete().eq('id', id)
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  function getLabel(a: Assignment) {
    if ((a as any).display_name) return (a as any).display_name
    if (!a.member) return '—'
    return `${a.member.first_name} ${a.member.last_name}`
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Role Assignments</h3>

      <div className="space-y-1.5 mb-3">
        {assignments.length === 0 && <p className="text-xs text-gray-400">No roles assigned yet.</p>}
        {assignments.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
            <div>
              <span className="text-xs font-medium text-red-700">{a.role}</span>
              <span className="text-xs text-gray-500 ml-2">{getLabel(a)}</span>
            </div>
            <button onClick={() => removeAssignment(a.id)} className="text-gray-300 hover:text-red-500">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
        >
          <option value="">Select person…</option>
          {people.some((p) => p.isParent) && (
            <optgroup label="Parents">
              {people.filter((p) => p.isParent).map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
          )}
          <optgroup label="Players">
            {people.filter((p) => !p.isParent).map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </optgroup>
        </select>
        <div className="flex gap-1.5">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 flex-1"
          >
            {PRESET_ROLES.map((r) => <option key={r}>{r}</option>)}
            <option value="Custom">Custom…</option>
          </select>
          {selectedRole === 'Custom' && (
            <input
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Role name"
              className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 flex-1"
            />
          )}
          <button
            onClick={addAssignment}
            className="bg-red-700 text-white rounded-lg px-2 py-1.5 hover:bg-red-800 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
