// src/components/WorkspaceLayout.js
export default function WorkspaceLayout({ tools, visualization }) {
  // Using a CSS variable for height calculation
  const stickyHeight = "lg:h-[calc(100vh-var(--header-height,6rem))]";

  return (
    <div className="w-full px-3 pb-4 sm:px-6">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${stickyHeight} mb-16 sm:mb-24`}>
        {/* Left column - Tools panel */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {tools}
        </div>
        
        {/* Right column - Visualization */}
        <div className="mt-6 lg:mt-0 lg:col-span-9 bg-[#000000] rounded-xl shadow-sm border border-[#1F2937] overflow-hidden min-h-[500px] lg:min-h-[600px] h-full">
          {visualization}
        </div>
      </div>
    </div>
  );
}