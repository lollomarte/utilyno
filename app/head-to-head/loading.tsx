import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
