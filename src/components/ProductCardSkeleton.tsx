export const ProductCardSkeleton = () => (
  <div className="card flex flex-col overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);