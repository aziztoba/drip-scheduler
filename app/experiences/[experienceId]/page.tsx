import MemberCoursePage from "@/app/(member)/app/[companyId]/page";
import { resolveCompanyFromWhopResourceId } from "@/lib/whop/resource-map";

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">D</span>
      </div>
      <div className="text-center">
        <h2 className="text-white font-semibold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm max-w-md">{message}</p>
      </div>
    </div>
  );
}

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ preview?: string; token?: string }>;
}) {
  const { experienceId } = await params;
  const resolved = await resolveCompanyFromWhopResourceId(experienceId);

  if (!resolved) {
    return (
      <ErrorScreen
        title="Experience not linked"
        message="This Whop experience id is not mapped to a company in the app yet. Save the experience id on the company record (companies.whop_experience_id) and try again."
      />
    );
  }

  return MemberCoursePage({
    params: Promise.resolve({ companyId: resolved.internalCompanyId }),
    searchParams,
  });
}
