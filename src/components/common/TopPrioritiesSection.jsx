import SectionCard from './SectionCard.jsx';

export default function TopPrioritiesSection({ topPriorityFocus }) {
  return (
    <SectionCard title="Top priorities" className="relative block h-auto w-full">
      {topPriorityFocus?.length > 0 ? (
        <ol className="relative flex flex-col space-y-3 w-full">
          {topPriorityFocus.map((focus, index) => (
            <li 
              key={`${index}-${focus}`} 
              className="relative flex items-start gap-3 text-sm w-full"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="flex-1 leading-relaxed text-sm text-base-content whitespace-normal break-words">
                {focus}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">No priorities were listed.</p>
      )}
    </SectionCard>
  );
}