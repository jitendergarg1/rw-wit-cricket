'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Trophy, Users } from 'lucide-react'
import Image from 'next/image'

const links = [
  { href: '/', label: 'Trainings', icon: Dumbbell },
  { href: '/matches', label: 'Matches', icon: Trophy },
  { href: '/members', label: 'Members', icon: Users },
]

export default function NavBar() {
  const pathname = usePathname()
  return (
    <nav className="bg-red-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image src="/logo.png" alt="Rood en Wit" width={44} height={52} className="drop-shadow" />
          <span className="font-bold text-lg hidden sm:block">R&amp;W-Wit Cricket</span>
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href ? 'bg-white text-red-700' : 'hover:bg-red-600'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
