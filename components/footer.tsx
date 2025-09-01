import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © 2024 Games Bazaar. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm transition">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}