import Icon from '../components/ui/Icon.jsx';

export default function GuidePage() {
  const workflowSteps = [
    {
      step: '01',
      title: 'Analyze Your Baseline',
      description: 'Start by uploading your resume and dropping in your GitHub handle. Our AI will instantly grade your ATS compatibility and code quality.',
      icon: 'file-text'
    },
    {
      step: '02',
      title: 'Identify Knowledge Gaps',
      description: 'Take a Mock Interview or an Adaptive Quiz. The AI will evaluate your answers and pinpoint exactly what technical concepts you need to review.',
      icon: 'mic'
    },
    {
      step: '03',
      title: 'Generate a Roadmap',
      description: 'Based on your weak points, generate a personalized learning roadmap. Follow the nodes to master the skills you need for your target role.',
      icon: 'map'
    }
  ];

  const features = [
    {
      title: 'Resume Analyzer',
      description: 'Upload a PDF resume. The AI reads the text, scores it against ATS standards, and suggests bullet-point rewrites.',
      icon: 'file-search',
      color: 'text-info'
    },
    {
      title: 'GitHub Analyzer',
      description: 'Enter any public GitHub username. CareerOS evaluates language diversity, commit frequency, and repository quality.',
      icon: 'github',
      color: 'text-warning'
    },
    {
      title: 'Mock Interviews',
      description: 'Practice real-time technical and behavioral questions. Speak your answers aloud, and get scored on clarity and technical accuracy.',
      icon: 'video',
      color: 'text-primary'
    },
    {
      title: 'Dynamic Roadmaps',
      description: 'Enter a topic (e.g., "React Hooks" or "System Design"). Get an interactive, node-based graph breaking the subject into digestible steps.',
      icon: 'git-merge',
      color: 'text-success'
    },
    {
      title: 'Portfolio Builder',
      description: 'Generate a stunning, public-facing portfolio website in one click, pre-filled with your GitHub and Resume data.',
      icon: 'layout',
      color: 'text-secondary'
    },
    {
      title: 'Job Tracker',
      description: 'Search for live jobs and drag-and-drop them into your pipeline tracker to manage your application lifecycle.',
      icon: 'briefcase',
      color: 'text-accent'
    }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d]/80 px-8 py-16 sm:px-16 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.15),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            How to use <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">CareerOS</span>
          </h1>
          <p className="text-lg text-muted">
            Your all-in-one AI platform to optimize your profile, ace interviews, and land your dream tech job.
          </p>
        </div>
      </section>

      {/* The Core Workflow */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">The Recommended Workflow</h2>
          <p className="mt-2 text-sm text-muted">Follow these three steps to get the most out of the platform.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {workflowSteps.map((item, idx) => (
            <div key={idx} className="relative flex flex-col rounded-2xl border border-base-300 bg-surface-1 p-8 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <span className="absolute -top-4 right-6 text-6xl font-black text-white/[0.03] select-none">
                {item.step}
              </span>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={item.icon} className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Feature Directory</h2>
          <p className="mt-2 text-sm text-muted">Detailed explanations of every tool at your disposal.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="group flex flex-col justify-between rounded-xl border border-base-300 bg-surface-1 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.02]">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Icon name={feature.icon} className={`h-5 w-5 ${feature.color}`} />
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Help Banner */}
      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:flex-row sm:px-12">
        <div>
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="mt-1 text-sm text-muted">Use the AI Mentor chat in the bottom right corner of your screen to ask specific questions about any page you are on.</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
          <Icon name="sparkles" className="h-6 w-6" />
        </div>
      </section>

    </div>
  );
}