import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <div className="flex flex-col items-center gap-1.5 mb-8">
        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        <h1 className="font-display text-xl font-bold">Area amministrazione</h1>
      </div>
      <LoginForm redirectTo={redirect ?? "/admin"} />
    </div>
  );
}
