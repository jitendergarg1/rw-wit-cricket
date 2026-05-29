import { createClient } from '@/lib/supabase/server'
import TrainingList from '@/components/TrainingList'
import type { Event, Member } from '@/lib/types'

export default async function TrainingsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: trainings }, { data: members }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('type', 'training')
      .gte('date', today)
      .order('date', { ascending: true }),
    supabase.from('members').select('*').order('last_name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Trainings</h1>
      <p className="text-sm text-gray-500">Every Tuesday &amp; Friday 16:30 – 18:00. Tick if you <strong>cannot</strong> make it.</p>
      <TrainingList trainings={(trainings as Event[]) ?? []} members={(members as Member[]) ?? []} />
    </div>
  )
}
