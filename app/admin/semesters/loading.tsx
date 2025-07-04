export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-700 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="h-10 w-full bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <div className="h-6 w-32 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-slate-700 rounded animate-pulse mt-2"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
