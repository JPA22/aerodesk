export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-72" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-7 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/4 mb-6" />
          <div className="h-48 bg-slate-200 rounded-lg" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl overflow-hidden animate-pulse">
          <div className="p-6 border-b border-slate-100">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
              <div className="h-14 w-20 bg-slate-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
