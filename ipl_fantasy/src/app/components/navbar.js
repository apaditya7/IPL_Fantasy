// src/app/components/Navbar.js
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-black-600 text-white py-4 px-6 shadow-md border-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link href="/" className="hover:text-gray-200">
            IPL Fantasy
          </Link>
        </div>
        <div className="flex space-x-6">
          <Link href="/" className="hover:text-gray-200">
            Home
          </Link>
          <Link href="/pages/teams" className="hover:text-gray-200">
            Teams
          </Link>
          <Link href="/players" className="hover:text-gray-200">
            Players
          </Link>
          <Link href="/pages/dashboard" className="hover:text-gray-200">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}