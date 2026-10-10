import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Code2, Briefcase, Trophy, MapPin, Copy, Check, Clock, 
  ArrowUpRight, Sparkles, Server, Database, Cpu, Terminal, 
  CheckCircle2, GitBranch, ExternalLink 
} from 'lucide-react';

import Button from '../../components/ui/Button.jsx';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton.jsx';
import { useApi } from '../../hooks/useApi.js';
import { portfolioApi } from '../../services/api/index.js';
import { formatDateRange, sortByOrder } from '../../utils/portfolio.js';

// ==========================================
// 1. HELPER COMPONENTS (Reveal, Typewriter)
// ==========================================

function Reveal({ children, delay = 0, style, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProfileImage({ url, initials = 'SD', size = 320 }) {
  const [errored, setErrored] = useState(false);
  const showImage = url && !errored;

  return (
    <div className="animated-aura-wrapper" style={{ width: size, height: size }}>
      <div
        className="avatar-frame"
        style={{
          width: '100%', height: '100%', borderRadius: '50%',
          border: '2px solid rgba(56, 189, 248, 0.8)', overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(160deg, #0b1026, #05070f)', position: 'relative', zIndex: 2,
        }}
      >
        {showImage ? (
          <img src={url} alt="Profile" onError={() => setErrored(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.32, color: 'rgba(255,255,255,0.85)' }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. SLIDE COMPONENTS
// ==========================================

function HeroSlide({ p, contact }) {
  const loopPhrases = [p.headline || 'MERN Stack Developer', 'Building Web Apps', 'Writing Clean Code', 'Solving Problems'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullPhrase = loopPhrases[phraseIndex] || '';
    const typingSpeed = isDeleting ? 40 : 80;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullPhrase.substring(0, displayText.length + 1));
        if (displayText === currentFullPhrase) setTimeout(() => setIsDeleting(true), 1800);
      } else {
        setDisplayText(currentFullPhrase.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % loopPhrases.length);
        }
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, loopPhrases]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap-reverse', alignItems: 'center', justifyContent: 'center', gap: 'clamp(32px, 6vw, 70px)', maxWidth: 1400, width: '100%', margin: '0 auto', padding: '0 20px' }}>
      <Reveal style={{ flex: '1 1 580px', maxWidth: 800, minWidth: 300 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="eyebrow" style={{ margin: 0 }}>&gt; whoami</p>
          <h1 className="section-title" style={{ color: '#fff', fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)', margin: '0 0 4px 0', lineHeight: 1.1 }}>
            {p.contact?.name || 'Hello, World.'}
          </h1>
          <p style={{ color: 'var(--cyan)', fontWeight: 600, margin: '0 0 12px', fontSize: 'clamp(18px, 2.5vw, 24px)', fontFamily: 'var(--font-mono)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
            <span>{displayText}</span>
            <span style={{ display: 'inline-block', width: '8px', height: '22px', backgroundColor: 'var(--cyan)', marginLeft: '6px', animation: 'blink 1s step-end infinite' }} />
          </p>
          <p className="body-text" style={{ margin: '0 0 12px', fontSize: '1.08rem', lineHeight: '1.65' }}>{p.bio || 'Passionate developer building high-performance web applications.'}</p>
          
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div><h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>MERN</h4><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Full-Stack Focus</p></div>
            <div><h4 style={{ fontSize: '1.3rem', color: 'var(--cyan)', margin: 0, fontWeight: 700 }}>REST</h4><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>API Architecture</p></div>
            <div><h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0, fontWeight: 700 }}>100%</h4><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Responsive UI</p></div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 16 }}>
            <a href="#projects" className="btn-glow">Explore Projects ↗</a>
            <a href="#skills" className="btn-ghost" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}>
              View Skills &amp; Stack ⚡
            </a>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <ProfileImage url={p.profilePhotoUrl} size={320} />
      </Reveal>
    </div>
  );
}

function SkillsSlide({ skills = [] }) {
  const displaySkills = skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js', 'MongoDB'];
  const topSkills = displaySkills.slice(0, 4).map((s, i) => ({ name: s, level: 95 - (i * 5) }));

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', width: '100%', padding: '0 10px' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2vw, 24px)' }}>
        <p className="eyebrow" style={{ margin: 0, justifyContent: 'center' }}>&gt; ls ./skills</p>
        <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>Skills &amp; Tech Stack</h2>
      </Reveal>

      {/* Marquee Ticker */}
      <Reveal delay={0.03} style={{ marginBottom: '40px', overflow: 'hidden', width: '100%' }}>
        <div style={{ display: 'flex', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, ease: 'linear', duration: 30 }} style={{ display: 'flex', gap: '16px', whiteSpace: 'nowrap', width: 'max-content' }}>
            {[...displaySkills, ...displaySkills, ...displaySkills].map((item, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '999px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }} />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </Reveal>

      {/* Core Proficiency */}
      <Reveal delay={0.1} style={{ marginBottom: '36px', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sparkles size={18} color="var(--cyan)" />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-mono)' }}>Core Proficiency</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {topSkills.map((skill) => (
            <div key={skill.name} className="skill-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span>{skill.name}</span><span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{skill.level}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--violet))', borderRadius: '999px', boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)' }} />
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* All Skills Cloud */}
      <Reveal delay={0.2} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '0 10px', marginTop: '40px' }}>
        {displaySkills.map((item, idx) => (
          <motion.span
            key={idx} whileHover={{ scale: 1.05, y: -2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 500, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#e2e8f0', cursor: 'default', backdropFilter: 'blur(8px)', transition: 'all 0.25s ease' }}
          >
            <Terminal size={13} style={{ color: 'var(--cyan)', opacity: 0.8 }} /> {item}
          </motion.span>
        ))}
      </Reveal>
    </div>
  );
}

function ProjectsSlide({ projects = [] }) {
  const [activeProject, setActiveProject] = useState(projects[0] || null);
  if (!projects || projects.length === 0) return null;

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', width: '100%', padding: '0 10px' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vw, 28px)' }}>
        <p className="eyebrow" style={{ margin: 0, justifyContent: 'center' }}>&gt; ls ./projects</p>
        <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>Featured Projects</h2>
      </Reveal>

      <Reveal delay={0.05} style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', padding: '4px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {projects.map((p) => {
            const isActive = activeProject._id === p._id;
            return (
              <button key={p._id} onClick={() => setActiveProject(p)} style={{ position: 'relative', padding: '9px 20px', borderRadius: '999px', border: 'none', background: 'transparent', color: isActive ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                {isActive && <motion.div layoutId="activeProjectTab" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(167, 139, 250, 0.3) 100%)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)', borderRadius: '999px', zIndex: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span style={{ position: 'relative', zIndex: 1 }}>{p.title}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        <motion.div key={activeProject._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              {activeProject.featured && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><Sparkles size={16} color="var(--cyan)" /><span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>Featured Project</span></div>}
              <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#fff', margin: 0 }}>{activeProject.title}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>{activeProject.description}</p>
            {activeProject.techStack?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeProject.techStack.map((t) => <span key={t} style={{ padding: '5px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>{t}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
              {activeProject.liveUrl && <a href={activeProject.liveUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--cyan) 0%, #0284c7 100%)', color: '#0f172a', fontWeight: 600, fontSize: '13.5px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.35)' }}>Live Demo <ExternalLink size={14} /></a>}
              {activeProject.githubUrl && <a href={activeProject.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontWeight: 600, fontSize: '13.5px', textDecoration: 'none' }}><GitBranch size={16} /> Source Code</a>}
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)', backdropFilter: 'blur(12px)', padding: '16px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} /><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
              <div style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>{activeProject.title.toLowerCase().replace(/\s+/g, '-')}.app</div>
            </div>
            <div style={{ flex: 1, borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeProject.imageUrl ? <img src={activeProject.imageUrl} alt={activeProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} /> : <Code2 size={36} color="var(--cyan)" style={{ opacity: 0.5 }} />}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ExperienceSlide({ experience = [], education = [] }) {
  if (experience.length === 0 && education.length === 0) return null;
  
  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', width: '100%', padding: '0 10px' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vw, 28px)' }}>
        <p className="eyebrow" style={{ margin: 0, justifyContent: 'center' }}>&gt; cat ./history.log</p>
        <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>Experience &amp; Education</h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        {experience.length > 0 && (
          <Reveal delay={0.1}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Briefcase size={18} color="var(--cyan)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Experience</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
              {experience.map(job => (
                <div key={job._id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--cyan)', left: '-27px', top: '4px', boxShadow: '0 0 10px var(--cyan-glow)' }} />
                  <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{job.role}</h4>
                  <p style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '13px', margin: '0 0 8px 0' }}>@ {job.company}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 8px 0' }}>{formatDateRange(job.startDate, job.endDate, { current: job.endDate == null })}</p>
                  {job.description && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{job.description}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {education.length > 0 && (
          <Reveal delay={0.2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Trophy size={18} color="var(--violet)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Education</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
              {education.map(ed => (
                <div key={ed._id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--violet)', left: '-27px', top: '4px', boxShadow: '0 0 10px var(--violet-glow)' }} />
                  <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{ed.degree} {ed.fieldOfStudy && `in ${ed.fieldOfStudy}`}</h4>
                  <p style={{ color: 'var(--violet)', fontFamily: 'var(--font-mono)', fontSize: '13px', margin: '0 0 8px 0' }}>{ed.institution}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>{formatDateRange(ed.startDate, ed.endDate)}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

function ContactSlide({ contact }) {
  const [copied, setCopied] = useState(false);
  const [timeString, setTimeString] = useState('');
  
  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const links = [
    contact.github && { label: 'GitHub', href: contact.github, Icon: Code2 },
    contact.linkedin && { label: 'LinkedIn', href: contact.linkedin, Icon: Briefcase },
    contact.twitter && { label: 'Twitter', href: contact.twitter, Icon: Terminal },
  ].filter(Boolean);

  return (
    <div style={{ maxWidth: 950, margin: '0 auto', width: '100%', padding: '0 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Reveal style={{ textAlign: 'left', marginBottom: '24px' }}>
        <p className="eyebrow" style={{ margin: '0 0 4px 0' }}>&gt; connect</p>
        <h2 className="section-title" style={{ color: '#ffffff', margin: 0 }}>Let&rsquo;s talk</h2>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <Reveal delay={0.05} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
            <Sparkles size={18} color="var(--cyan)" style={{ flexShrink: 0 }} />
            <span>Open to talk about <strong style={{ color: 'var(--cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Opportunities</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color="var(--cyan)" />
              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: '#fff' }}>{contact.email || 'No email provided'}</span>
            </div>
            <button onClick={handleCopyEmail} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)', border: '1px solid ' + (copied ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'), color: copied ? '#4ade80' : '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {contact.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--cyan)" /><span>{contact.location}</span></div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}><Clock size={14} color="var(--cyan)" /><span>{timeString} IST</span></div>
          </div>
        </Reveal>

        <Reveal delay={0.1} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} /> Open to Work
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {links.map(({ label, href, Icon }) => (
              <motion.a key={label} href={href} target="_blank" rel="noreferrer" whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }} style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Icon size={18} color="var(--cyan)" /><span>{label}</span></div>
                <ArrowUpRight size={16} color="var(--text-muted)" />
              </motion.a>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN PAGE COMPONENT (The App & Theme Setup)
// ==========================================

export default function PublicPortfolio() {
  const { slug } = useParams();
  const { data: p, error, loading } = useApi(() => portfolioApi.getPublicPortfolio(slug), [slug]);

  useEffect(() => {
    document.title = p?.headline ? `${p.headline} · Portfolio` : 'Portfolio';
  }, [p]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#05070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
          <Skeleton className="h-8 w-1/3 mb-4 opacity-20" />
          <SkeletonText lines={4} className="opacity-20" />
        </div>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div style={{ minHeight: '100vh', background: '#05070f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff' }}>
        <Terminal className="h-12 w-12 text-error mb-4" />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#ef4444' }}>404</h1>
        <p style={{ color: '#7d81a0', marginBottom: '24px' }}>Connection refused. This portfolio node does not exist.</p>
        <Button as={Link} to="/" variant="outline">Return to Base</Button>
      </div>
    );
  }

  const contact = p.contact || {};
  const projects = sortByOrder(p.projects);
  const experience = sortByOrder(p.experience);
  const education = sortByOrder(p.education);
  
  // Custom Color injection if they customized it, otherwise your default Cyan
  const themeAccent = p.themeColor || '#38bdf8';

  return (
    <div className="portfolio-theme-root">
      {/* MASSIVE CSS INJECTION FROM YOUR THEME FILES */}
      <style>{`
        .portfolio-theme-root {
          --bg-deep: #05070f;
          --bg-nebula: #0b1026;
          --bg-panel: rgba(15, 23, 42, 0.75);
          --border-subtle: rgba(255, 255, 255, 0.08);
          --text-primary: #ffffff;
          --text-secondary: #c7cbe0;
          --text-muted: #7d81a0;
          
          /* Dynamic Accent Colors */
          --cyan: ${themeAccent};
          --cyan-glow: ${themeAccent}60;
          --violet: #a78bfa;
          --violet-glow: rgba(167, 139, 250, 0.4);
          
          --font-display: 'Space Grotesk', system-ui, sans-serif;
          --font-body: 'Inter', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          
          background: var(--bg-deep);
          background-image: radial-gradient(ellipse at 50% 0%, var(--bg-nebula) 0%, var(--bg-deep) 70%);
          color: var(--text-primary);
          font-family: var(--font-body);
          height: 100vh;
          overflow-y: auto;
          scroll-snap-type: y proximity;
          scroll-behavior: smooth;
        }

        /* Top Nav */
        .top-nav {
          position: fixed; top: 0; left: 0; width: 100%; height: 64px; z-index: 1000;
          display: flex; alignItems: center; justify-content: space-between;
          padding: 0 clamp(16px, 4vw, 40px); background: rgba(10, 14, 28, 0.9);
          backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid var(--border-subtle);
        }
        .nav-icon-pill {
          display: inline-flex; align-items: center; justify-content: center;
          height: 36px; width: 36px; border-radius: 8px; border: 1px solid var(--border-subtle);
          color: var(--text-secondary); transition: all 0.2s ease;
        }
        .nav-icon-pill:hover { color: var(--cyan); border-color: var(--cyan); box-shadow: 0 0 12px var(--cyan-glow); }

        /* Typography & Layout */
        .slide {
          min-height: 100vh; width: 100%; scroll-snap-align: start;
          display: flex; align-items: center; justify-content: center;
          padding: 80px 20px 40px;
        }
        .eyebrow { font-family: var(--font-mono); font-size: clamp(11px, 1.3vw, 13px); color: var(--cyan); margin-bottom: 8px; display: block; }
        .section-title { font-family: var(--font-display); font-weight: 700; font-size: clamp(2rem, 4vw, 3rem); margin: 6px 0 0; }
        .body-text { font-size: clamp(1rem, 1.4vw, 1.1rem); line-height: 1.65; color: var(--text-secondary); white-space: pre-line; }

        /* Buttons */
        .btn-glow {
          display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); font-weight: 600;
          font-size: clamp(12.5px, 1.5vw, 14px); padding: 10px 18px; border-radius: 10px; text-decoration: none;
          background: linear-gradient(135deg, var(--cyan), var(--violet)); color: #05070f; transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-glow:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 28px -6px var(--cyan-glow); }
        
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px;
          text-decoration: none; font-weight: 600; font-size: clamp(13px, 1.6vw, 15px); color: var(--text-primary);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .btn-ghost:hover { transform: translateY(-2px) scale(1.02); border-color: var(--cyan); box-shadow: 0 10px 28px -8px var(--cyan-glow); }

        /* Avatar Aura */
        .avatar-frame { transition: transform 0.3s ease; animation: avatar-aura 3.2s ease-in-out infinite; }
        .avatar-frame:hover { transform: scale(1.04); }
        @keyframes avatar-aura {
          0%, 100% { box-shadow: 0 0 35px var(--cyan-glow), 0 0 0 6px rgba(56, 189, 248, 0.08); }
          50% { box-shadow: 0 0 55px var(--cyan-glow), 0 0 0 8px rgba(56, 189, 248, 0.14); }
        }
        .animated-aura-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
        .animated-aura-wrapper::before, .animated-aura-wrapper::after {
          content: ''; position: absolute; inset: -6px; border-radius: 50%;
          background: conic-gradient(from 0deg, var(--cyan-glow), rgba(167,139,250,0.5), rgba(236,72,153,0.4), var(--cyan-glow));
          filter: blur(10px); opacity: 0.45; z-index: 1; animation: spinAura 10s linear infinite;
        }
        .animated-aura-wrapper::after { inset: -10px; filter: blur(16px); opacity: 0.25; animation: pulseAura 4s ease-in-out infinite alternate, spinAura 14s linear infinite reverse; }
        @keyframes spinAura { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulseAura { 0% { transform: scale(0.98); opacity: 0.2; } 100% { transform: scale(1.04); opacity: 0.4; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>

      {/* --- Global Top Navigation --- */}
      <nav className="top-nav">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--cyan)' }}>
          <span style={{ color: 'var(--text-muted)' }}>&lt;</span> {slug} <span style={{ color: 'var(--text-muted)' }}>/&gt;</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {contact.email && <a href={`mailto:${contact.email}`} className="nav-icon-pill" title="Email"><Mail size={16} /></a>}
          {contact.github && <a href={contact.github} target="_blank" rel="noreferrer" className="nav-icon-pill" title="GitHub"><Code2 size={16} /></a>}
          {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer" className="nav-icon-pill" title="LinkedIn"><Briefcase size={16} /></a>}
        </div>
      </nav>

      {/* --- Slide Container --- */}
      <div id="hero" className="slide"><HeroSlide p={p} contact={contact} /></div>
      <div id="skills" className="slide"><SkillsSlide skills={p.skills} /></div>
      <div id="projects" className="slide"><ProjectsSlide projects={projects} /></div>
      <div id="experience" className="slide"><ExperienceSlide experience={experience} education={education} /></div>
      <div id="contact" className="slide"><ContactSlide contact={contact} /></div>

    </div>
  );
}