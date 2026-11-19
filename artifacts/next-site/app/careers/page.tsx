import type { Metadata } from 'next'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Careers | SuperMovers',
  description:
    'Become a SuperMover. Explore open Packer, Mover/Helper, Mover/Driver/Team Lead, and Accounting Internship positions with SuperMovers in Athens.',
}

const EMAIL = 'contact@supermoversllc.com'

const jobs = [
  { title: 'Packers', desc: 'Carefully wrap and pack household goods for transit.', pay: '$14-$18/hour', tips: true },
  { title: 'Mover/Helper', desc: 'Assisting with loading, unloading, and moving heavy items.', pay: '$17-$20/hour', tips: true },
  { title: 'Mover/Driver/Team Lead', desc: 'Driving company vehicles, leading the team, and coordinating move logistics.', pay: '$19-$25/hour', tips: true },
  { title: 'Accounting Internship', desc: 'Gain practical experience in accounting and finance.', pay: 'Pay TBD', tips: false },
]

const roles = [
  {
    title: 'Movers',
    body: 'Our movers are the backbone of every job. You’ll load, transport, and unload furniture and belongings with care, working as part of a crew to get customers settled into their new space safely and on time. No experience needed. We train you on proper lifting and handling, and we’re looking for people who are punctual, hard working, and don’t have any quit!',
  },
  {
    title: 'Team Leads',
    body: 'Team leads guide the crew on the job site. You’ll run the day’s schedule, make sure items are handled properly, drive trucks, communicate with customers, and keep the team safe and on track. This role is for experienced movers who are ready to take on more responsibility, and are compensated with higher pay.',
  },
  {
    title: 'Packers',
    body: 'Packers prepare a customer’s belongings before the move. You’ll wrap, box, and label items, from kitchenware to fragile décor, so everything arrives in one piece. You don’t need to be strong for this role. It’s all about a careful touch and attention to detail, and the heavy lifting is left to our movers.',
  },
]

const lift = 'transition duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0'

export default function Careers() {
  return (
    <main className="bg-ink min-h-screen">
      {/* HERO */}
      <section className="bg-brand-blue relative overflow-hidden px-4 pt-20 pb-32 text-center">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-red/15 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto mt-6 max-w-3xl">
          <h1 className="font-heading font-extrabold text-white text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Become a SuperMover
          </h1>
          <div className="mx-auto mt-6 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
        </div>
      </section>

      {/* OPENINGS */}
      <section className="relative z-20 -mt-16 px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-black/50 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            <div>
              <h2 className="font-heading font-extrabold text-paper text-3xl md:text-4xl leading-tight">
                Our Employment Opportunities
              </h2>
              <div className="mt-5 h-1 w-16 rounded-full bg-brand-red" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/Supermovers_Careers.JPEG"
                alt="The SuperMovers crew"
                className="mt-8 aspect-[4/3] w-full rounded-2xl border border-border object-cover"
              />
            </div>
            <ul className="space-y-4">
              {jobs.map((j) => (
                <li
                  key={j.title}
                  className={`group rounded-2xl border border-border bg-ink/60 p-6 hover:-translate-y-1 hover:border-brand-red/70 hover:bg-tint-red/40 ${lift}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-paper text-xl">{j.title}</h3>
                      <p className="mt-2 font-body text-ink-muted leading-relaxed">{j.desc}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p
                        className={`inline-block rounded-lg px-3 py-1.5 font-heading font-extrabold text-lg ${
                          j.tips ? 'bg-brand-red text-white' : 'border border-border text-paper'
                        }`}
                      >
                        {j.pay}
                      </p>
                      {j.tips && (
                        <p className="mt-2 font-body text-sm text-paper/90">
                          plus tips, $2-$5 an hour on average
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHAT A SUPERMOVER DOES */}
      <section className="px-4 py-20 text-paper">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl">What Does a SuperMover Do?</h2>
          <div className="mx-auto mt-4 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {roles.map((r, i) => (
            <article
              key={r.title}
              className={`rounded-2xl border border-border bg-surface p-8 hover:-translate-y-1 hover:border-brand-red/60 md:p-10 ${lift}`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-red font-heading font-extrabold text-3xl text-white">
                  {i + 1}.
                </div>
                <h3 className="min-w-0 font-heading font-extrabold text-2xl">{r.title}</h3>
              </div>
              <p className="font-body text-ink-muted leading-relaxed">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* APPLY */}
      <section className="relative overflow-hidden bg-brand-blue px-4 py-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-heading font-extrabold text-white text-3xl md:text-4xl">Become a SuperMover Today</h2>
          <p className="mt-6 font-body text-lg text-paper/90 leading-relaxed">
            Email your resume and desired position to{' '}
            <a href={`mailto:${EMAIL}`} className="font-semibold text-white underline decoration-brand-red decoration-2 underline-offset-4 break-all hover:decoration-white transition-colors motion-reduce:transition-none">
              {EMAIL}
            </a>
            .
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className={`mt-8 inline-block rounded-md bg-brand-red px-10 py-4 font-heading font-bold text-lg text-paper shadow-xl shadow-black/20 hover:-translate-y-0.5 hover:bg-[#770000] ${lift}`}
          >
            Email {EMAIL}
          </a>
        </div>
      </section>
    </main>
  )
}
