import { createClient } from '@/lib/supabase/server'
import MemberList from '@/components/MemberList'
import type { Member } from '@/lib/types'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase.from('members').select('*').order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Members</h1>
      <MemberList members={(members as Member[]) ?? []} />
    </div>
  )
}
