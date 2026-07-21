import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-bold mb-6 text-center">Area amministrazione</h1>
      <LoginForm redirectTo={redirect ?? "/admin"} />
    </div>
  );
}
