const skills = ['React', 'TypeScript', 'Python', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']

export default function About() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-bold text-gray-900">About</h2>
      <div className="grid md:grid-cols-2 gap-12 items-start mt-8">
        <div>
          <p className="text-gray-600 leading-relaxed">
            Always curious and building. Let&apos;s discuss ideas and build!
          </p>
        </div>
        <div>
          <ul className="flex flex-wrap gap-2" aria-label="Skills">
            {skills.map((skill) => (
              <li key={skill}>
                <span className="bg-blue-50 text-brand rounded-full px-3 py-1 text-sm font-medium">
                  {skill}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
