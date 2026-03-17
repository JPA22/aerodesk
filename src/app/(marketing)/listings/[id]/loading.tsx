export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery skeleton */}
            <div className="bg-slate-200 rounded-xl h-80 sm:h-96 animate-pulse" />

            {/* Title block */}
            <div className="bg-white rounded-xl p-6 space-y-3 animate-pulse">
              <div className="h-7 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="flex gap-3 mt-4">
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Specs table */}
            <div className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/4 mb-5" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 animate-pulse space-y-2">
              <div className="h-5 bg-slate-200 rounded w-1/4 mb-4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 bg-slate-200 rounded" />
              ))}
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-white rounded-xl p-6 animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/2" />
              <div className="h-11 bg-slate-200 rounded-lg" />
              <div className="h-11 bg-slate-200 rounded-lg" />
            </div>

            {/* Valuation card */}
            <div className="bg-white rounded-xl p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded-full" />
              <div className="flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>

            {/* Dealer card */}
            <div className="bg-white rounded-xl p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-slate-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
