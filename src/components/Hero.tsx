import { SOCIAL_LINKS } from '@/constants/social'

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
      <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Manan Khasgiwale</h1>
      <p className="text-xl text-gray-500 max-w-md">
        Curious software engineer proficient with helping build data pipelines
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="#projects"
          className="bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          View Projects
        </a>
        <a
          href={SOCIAL_LINKS.email}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Contact
        </a>
      </div>
    </section>
  )
}
