import { Link } from 'react-router-dom';

import Reveal from '../components/ui/Reveal.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import ScoreRing from '../components/ui/ScoreRing.jsx';
import Tilt from '../components/ui/Tilt.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const FEATURES = [
  {
    icon: 'document',
    title: 'Resume & ATS analyzer',
    text: 'Upload a PDF or Word resume, get an ATS score, missing keywords, and rewritten bullet points. Add a job description to see how well you match.',
  },
  {
    icon: 'code',
    title: 'GitHub analyzer',
    text: 'See your language mix, recent activity, and repo health (README, tests, CI) with a plain-English read on your skill level.',
  },
  {
    icon: 'microphone',
    title: 'AI mock interviews',
    text: 'Practice technical, behavioral, or DSA interviews. Answer by typing or speaking and get scored feedback after every question.',
  },
  {
    icon: 'user',
    title: 'Career profile',
    text: 'Your resume, GitHub, and interview results combined into one view of your skills, strengths, and what to work on next.',
  },
  {
    icon: 'map',
    title: 'Learning roadmap',
    text: 'A prioritized, ordered plan for a target role that skips what you already know. Track progress topic by topic.',
  },
  {
    icon: 'globe',
    title: 'Portfolio builder',
    text: 'Pre-fill a portfolio from your profile and repos, polish the wording, and publish it to a shareable link.',
  },
];

const STEPS = [
  { title: 'Add your material', text: 'Analyze your resume, your GitHub profile, or take a mock interview.' },
  { title: 'Generate your profile', text: 'CareerOS merges the results into a single career profile.' },
  { title: 'Follow the plan', text: 'Build a roadmap for your target role and publish your portfolio.' },
];

const STATS = [
  { value: '6', label: 'Tools in one workflow' },
  { value: '100', label: 'Point ATS & interview scoring' },
  { value: '1', label: 'Profile built from everything' },
];

export default function Landing() {
  useDocumentTitle();
  const { status } = useAuth();
  const authed = status === 'authenticated';

  return (
    <>
      {/* ---------- Hero: metadata pill, large type, live product preview ---------- */}
      <section className="relative overflow-hidden">
        <div className="grid-veil pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              AI-assisted career toolkit
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Know where you stand.
              <br />
              Plan what to learn next.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              CareerOS reviews your resume and GitHub, runs mock interviews, and turns the results into a learning
              roadmap and a public portfolio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {authed ? (
                <Button as={Link} to="/dashboard" size="lg">
                  Open dashboard
                  <Icon name="arrow-right" className="h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/register" size="lg">
                    Create free account
                    <Icon name="arrow-right" className="h-5 w-5" />
                  </Button>
                  <Button as={Link} to="/login" variant="outline" size="lg">
                    Sign in
                  </Button>
                </>
              )}
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-base-300 pt-7">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="stat-figure text-2xl sm:text-3xl">{stat.value}</dd>
                  <dt className="mt-1 text-xs leading-snug text-faint">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Product preview: layered panels built from the app's own primitives, not stock art */}
          <Reveal delay={120} className="relative">
            <Tilt max={2.5} className="surface p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Career profile</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Developing
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 rounded-box border border-base-300 bg-white/[0.03] p-4">
                <ScoreRing value={78} size={64} label="ATS score" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Resume · ATS score</p>
                  <p className="mt-0.5 text-xs text-muted">Backend Developer · updated 2d ago</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-box border border-base-300 bg-white/[0.03] p-3.5">
                  <p className="eyebrow">GitHub</p>
                  <p className="stat-figure mt-1 text-xl">Intermediate</p>
                  <p className="mt-0.5 text-xs text-muted">42 stars · 8 repos</p>
                </div>
                <div className="rounded-box border border-base-300 bg-white/[0.03] p-3.5">
                  <p className="eyebrow">Interviews</p>
                  <p className="stat-figure mt-1 text-xl">81/100</p>
                  <p className="mt-0.5 text-xs text-muted">Latest · Frontend Dev</p>
                </div>
              </div>

              <div className="mt-3 rounded-box border border-base-300 bg-white/[0.03] p-3.5">
                <p className="eyebrow mb-2">Roadmap progress</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Full-stack Developer</span>
                  <span className="font-medium text-white">33%</span>
                </div>
                <progress className="progress progress-primary mt-2 h-1.5 w-full" value={33} max="100" aria-hidden="true" />
              </div>
            </Tilt>

            {/* Small floating chip layered over the panel for depth */}
            <div className="surface absolute -bottom-5 -left-5 hidden w-44 rotate-[-3deg] p-3.5 sm:block">
              <p className="eyebrow">Next step</p>
              <p className="mt-1 text-sm font-medium leading-snug text-white">Publish your portfolio</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Feature grid ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal className="max-w-xl">
          <p className="eyebrow mb-3">What's inside</p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Everything in one place</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">Six tools that build on each other.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <Tilt className="surface h-full p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-base-300 bg-white/[0.04] text-white">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.text}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- How it works: full-width strip, split from the grid rhythm above ---------- */}
      <section className="border-y border-base-300 bg-base-200/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal className="max-w-xl">
            <p className="eyebrow mb-3">Process</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">How it works</h2>
          </Reveal>
          <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 80}>
                <li className="surface flex h-full gap-4 p-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      {!authed && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="surface grid-veil relative overflow-hidden px-6 py-14 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Start with your resume</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted sm:text-base">
              It takes a minute to sign up, and your first analysis takes less than that.
            </p>
            <div className="mt-7 flex justify-center">
              <Button as={Link} to="/register" size="lg">
                Get started
                <Icon name="arrow-right" className="h-5 w-5" />
              </Button>
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}
