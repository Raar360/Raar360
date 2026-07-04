import { AppShell } from "@/components/layout/AppShell";
import { PinGate } from "@/components/coach/PinGate";
import { BackButton } from "@/components/layout/BackButton";

export default function CoachPage() {
  return (
    <AppShell>
      <BackButton href="/" />
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <PinGate />
      </div>
    </AppShell>
  );
}
