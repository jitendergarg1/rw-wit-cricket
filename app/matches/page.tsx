import { createClient } from '@/lib/supabase/server'
import MatchList from '@/components/MatchList'
import type { Event, Member } from '@/lib/types'

export default async function MatchesPage() {
  const supabase = await createClient()

  const [{ data: matches }, { data: members }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('type', 'match')
      .order('date', { ascending: true }),
    supabase.from('members').select('*').order('last_name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
      <MatchList matches={(matches as Event[]) ?? []} members={(members as Member[]) ?? []} />
    </div>
  )
}
