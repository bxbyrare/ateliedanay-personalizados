export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2" aria-hidden="true">
      <span className="h-px w-16 bg-stone-300" />
      <svg width="14" height="14" viewBox="0 0 14 14" className="text-[#8B0000]" fill="none">
        <path d="M7 0L8.7 5.3L14 7L8.7 8.7L7 14L5.3 8.7L0 7L5.3 5.3L7 0Z" fill="currentColor" fillOpacity="0.6" />
      </svg>
      <span className="h-px w-16 bg-stone-300" />
    </div>
  );
}
