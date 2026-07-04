import { AppShell } from "@/components/layout/AppShell";
import { StoryEngine } from "@/components/story/StoryEngine";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  return (
    <AppShell showFooter={false}>
      <StoryEngine bookId={bookId} />
    </AppShell>
  );
}
