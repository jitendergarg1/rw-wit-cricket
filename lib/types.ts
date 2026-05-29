export type EventType = 'training' | 'match'

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  type: EventType
  date: string
  time: string
  location: string
  notes?: string
  created_at: string
}

export interface Attendance {
  id: string
  event_id: string
  member_id: string
  status: 'attending' | 'not_attending' | 'maybe'
  member?: Member
}

export interface Assignment {
  id: string
  event_id: string
  member_id: string
  role: string
  member?: Member
}
