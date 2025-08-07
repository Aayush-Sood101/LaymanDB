// src/components/WorkspaceLayout.js
export default function WorkspaceLayout({ tools, visualization }) {
  // Using a CSS variable for height calculation
  const stickyHeight = "h-[calc(100vh-var(--header-height,6rem))]";

  return (
    <div className="w-full px-3 pb-4 sm:px-6">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${stickyHeight}`}>
        {/* Left column - Tools panel */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-full lg:overflow-y-auto">
          {tools}
        </div>
        
        {/* Right column - Visualization */}
        {/* The 'mt-6' class adds a 1.5rem margin to the top of this card */}
        <div className="mt-6 lg:mt-0 lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[70vh] lg:h-full">
          {visualization}
        </div>
      </div>
    </div>
  );
}