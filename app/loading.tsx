import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <Skeleton className="h-48 rounded-3xl" />
      </section>
      <section>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-end justify-center gap-3">
          <Skeleton className="h-24 flex-1 rounded-t-lg" />
          <Skeleton className="h-32 flex-1 rounded-t-lg" />
          <Skeleton className="h-20 flex-1 rounded-t-lg" />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32 mb-2" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </section>
    </div>
  );
}
