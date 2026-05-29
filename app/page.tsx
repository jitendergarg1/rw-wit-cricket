import { createClient } from '@/lib/supabase/server'
import EventList from '@/components/EventList'
import AddEventForm from '@/components/AddEventForm'
import type { Event, Member } from '@/lib/types'

export default async function SchedulePage() {
  const supabase = await createClient()

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase.from('events').select('*').order('date', { ascending: true }),
    supabase.from('members').select('*').order('name'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
      </div>
      <AddEventForm />
      <EventList events={(events as Event[]) ?? []} members={(members as Member[]) ?? []} />
    </div>
  )
}
