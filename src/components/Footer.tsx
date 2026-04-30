import SocialLinks from '@/components/SocialLinks'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Manan. All rights reserved.
        </p>
        <SocialLinks />
      </div>
    </footer>
  )
}
