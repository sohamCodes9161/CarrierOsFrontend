import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton.jsx';
import { useApi } from '../../hooks/useApi.js';
import { portfolioApi } from '../../services/api/index.js';
import { formatDateRange, formatPortfolioDate, safeColor, safeHref, sortByOrder } from '../../utils/portfolio.js';

const LINKS = [
  { key: 'website', label: 'Website' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'twitter', label: 'Twitter / X' },
];

function Section({ title, accent, children }) {
  return (
    <section className="mt-12" aria-label={title}>
      <h2 className="mb-5 border-b border-base-300 pb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Public, unauthenticated view of a published portfolio at /p/:slug. */
export default function PublicPortfolio() {
  const { slug } = useParams();
  const { data: p, error, loading } = useApi(() => portfolioApi.getPublicPortfolio(slug), [slug]);

  useEffect(() => {
    document.title = p?.headline ? `${p.headline} · Portfolio` : 'Portfolio';
  }, [p]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16" role="status">
        <span className="sr-only">Loading portfolio…</span>
        <Skeleton className="h-8 w-2/3" />
        <SkeletonText lines={4} className="mt-6" />
      </div>
    );
  }

  if (error || !p) {
    const notFound = error?.status === 404;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 text-center">
        <h1 className="text-2xl font-semibold">{notFound ? 'Portfolio not found' : 'Couldn’t load this portfolio'}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {notFound ? 'This portfolio doesn’t exist or isn’t public.' : error?.message || 'Please try again in a moment.'}
        </p>
        <Button as={Link} to="/" className="mt-6" variant="outline">
          Go to CareerOS
        </Button>
      </div>
    );
  }

  const accent = safeColor(p.themeColor);
  const contact = p.contact || {};
  const projects = sortByOrder(p.projects);
  const experience = sortByOrder(p.experience);
  const education = sortByOrder(p.education);
  const achievements = sortByOrder(p.achievements);
  const links = LINKS.map((l) => ({ ...l, href: safeHref(contact[l.key]) })).filter((l) => l.href);
  const hasContact = contact.email || contact.phone || contact.location || links.length > 0;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} aria-hidden="true" />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6">
        <header>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{p.headline || 'Portfolio'}</h1>
          {p.bio && <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-base-content/80">{p.bio}</p>}

          {hasContact && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {contact.location && <li className="text-muted">{contact.location}</li>}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="font-medium hover:underline" style={{ color: accent }}>
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && <li className="text-muted">{contact.phone}</li>}
              {links.map((l) => (
                <li key={l.key}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: accent }}>
                    {l.label}
                    <Icon name="external" className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </header>

        {p.skills?.length > 0 && (
          <Section title="Skills" accent={accent}>
            <ul className="flex flex-wrap gap-2">
              {p.skills.map((skill) => (
                <li key={skill} className="rounded-btn border border-base-300 bg-base-200 px-2.5 py-1 text-sm">
                  {skill}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects" accent={accent}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project) => {
                const image = safeHref(project.imageUrl);
                const code = safeHref(project.githubUrl);
                const live = safeHref(project.liveUrl);
                return (
                  <article key={project._id || project.title} className="surface lift group flex flex-col overflow-hidden">
                    {image && (
                      <div className="aspect-[16/9] overflow-hidden border-b border-base-300 bg-base-200">
                        <img
                          src={image}
                          alt={`Screenshot of ${project.title}`}
                          loading="lazy"
                          className="zoom-img h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-semibold">
                        {project.title}
                        {project.featured && (
                          <span className="ml-2 align-middle text-xs font-medium" style={{ color: accent }}>
                            Featured
                          </span>
                        )}
                      </h3>
                      {project.description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.description}</p>}
                      {project.techStack?.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {project.techStack.map((t) => (
                            <li key={t} className="rounded bg-base-200 px-2 py-0.5 text-xs">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                      {(code || live) && (
                        <div className="mt-auto flex gap-4 pt-4 text-sm font-medium">
                          {code && (
                            <a href={code} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent }}>
                              Code
                            </a>
                          )}
                          {live && (
                            <a href={live} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent }}>
                              Live demo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Experience" accent={accent}>
            <ol className="space-y-6">
              {experience.map((job) => (
                <li key={job._id || `${job.company}-${job.role}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">
                      {job.role} <span className="font-normal text-muted">· {job.company}</span>
                    </h3>
                    <span className="text-xs text-muted">{formatDateRange(job.startDate, job.endDate, { current: job.endDate == null && Boolean(job.startDate) })}</span>
                  </div>
                  {job.description && <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">{job.description}</p>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education" accent={accent}>
            <ol className="space-y-4">
              {education.map((ed) => (
                <li key={ed._id || `${ed.institution}-${ed.degree}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">
                      {ed.degree}
                      {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ''}
                    </h3>
                    <span className="text-xs text-muted">{formatDateRange(ed.startDate, ed.endDate)}</span>
                  </div>
                  <p className="text-sm text-muted">{ed.institution}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements" accent={accent}>
            <ul className="space-y-4">
              {achievements.map((a) => (
                <li key={a._id || a.title}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">{a.title}</h3>
                    {a.date && <span className="text-xs text-muted">{formatPortfolioDate(a.date)}</span>}
                  </div>
                  {a.description && <p className="mt-1 text-sm leading-relaxed text-muted">{a.description}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>

      <footer className="border-t border-base-300 py-5 text-center text-xs text-muted">
        Built with{' '}
        <Link to="/" className="font-medium hover:underline">
          CareerOS
        </Link>
      </footer>
    </div>
  );
}
