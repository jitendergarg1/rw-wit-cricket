'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, Trophy, Users, LogIn, LogOut, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { useAdmin } from '@/hooks/useAdmin'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/', label: 'Trainings', icon: Dumbbell },
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/members', label: 'Members', icon: Users },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, userEmail } = useAdmin()

  async function logout() {
    await createClient().auth.signOut()
    router.refresh()
  }

  return (
    <nav className="bg-red-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="Rood en Wit" width={44} height={52} className="drop-shadow" />
          <span className="font-bold text-lg hidden sm:block">R&amp;W-Wit Cricket</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href ? 'bg-white text-red-700' : 'hover:bg-red-600'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-red-500">
            {userEmail ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="hidden sm:flex items-center gap-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck size={11} /> Admin
                  </span>
                )}
                <button onClick={logout} className="flex items-center gap-1 px-2 py-1.5 rounded text-sm hover:bg-red-600 transition-colors" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 px-2 py-1.5 rounded text-sm hover:bg-red-600 transition-colors" title="Admin login">
                <LogIn size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
