import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-56 rounded-3xl" />
      {Array.from({ length: 3 }).map((_, s) => (
        <div key={s} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
