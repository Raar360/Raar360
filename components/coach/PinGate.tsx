"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPin, setCoachSession, hasPin } from "@/lib/coach/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";

export function PinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFirstSetup, setIsFirstSetup] = useState<boolean | null>(null);

  useEffect(() => {
    void hasPin().then((exists) => setIsFirstSetup(!exists));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Please enter at least 4 digits.");
      return;
    }
    const ok = await verifyPin(pin);
    if (!ok) {
      setError("That PIN didn't match. Try again.");
      return;
    }
    setCoachSession();
    router.push("/coach/library");
  };

  return (
    <Card className="mx-auto max-w-sm">
      <Typography variant="title" as="h1" className="mb-2 text-2xl">
        Coach Mode
      </Typography>
      <Typography variant="subtitle" className="mb-6 text-base">
        {isFirstSetup
          ? "Create a PIN to protect coach settings."
          : "Enter your coach PIN to continue."}
      </Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError(null);
          }}
          className="rounded-2xl border-2 border-outline/20 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-golden"
          aria-label="Coach PIN"
          autoComplete="off"
        />
        {error && (
          <Typography variant="subtitle" className="text-sm text-blush">
            {error}
          </Typography>
        )}
        <Button type="submit">Continue</Button>
      </form>
    </Card>
  );
}
