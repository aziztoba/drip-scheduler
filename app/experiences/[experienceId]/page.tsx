import MemberCoursePage from "@/app/(member)/app/[companyId]/page";

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ preview?: string; token?: string }>;
}) {
  const { experienceId } = await params;

  return MemberCoursePage({
    params: Promise.resolve({ companyId: experienceId }),
    searchParams,
  });
}
