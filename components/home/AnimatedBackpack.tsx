"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { Pip } from "@/components/characters/Pip";
import { HomeStoryList } from "@/components/home/HomeStoryList";
import { cn } from "@/lib/utils/cn";

export function AnimatedBackpack() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => router.push("/backpack"), 1200);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-5 py-4 sm:gap-6 sm:py-6">
      <Typography variant="title" as="h1" className="px-2 text-center">
        Pip&apos;s Backpack
      </Typography>
      <Typography variant="subtitle" className="max-w-md px-2 text-center">
        Stories live inside the backpack — tap one below, or open it first.
      </Typography>

      <HomeStoryList />

      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label="Open Pip's backpack"
        className="relative mt-2 outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
        animate={reduceMotion || opening ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 220" className="h-36 w-36 drop-shadow-gentle sm:h-44 sm:w-44">
          <rect x="40" y="70" width="120" height="120" rx="16" fill="#F5C842" stroke="#2C1810" strokeWidth="4" />
          <motion.g
            animate={opening ? { rotate: -28, y: -12, x: -8 } : { rotate: 0, y: 0, x: 0 }}
            style={{ originX: "40px", originY: "70px" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <path d="M40 70 Q100 20 160 70 L160 95 Q100 55 40 95 Z" fill="#E8A84C" stroke="#2C1810" strokeWidth="4" />
          </motion.g>
          <rect x="88" y="110" width="24" height="30" rx="4" fill="#5C4033" stroke="#2C1810" strokeWidth="3" />
        </svg>

        {opening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 -bottom-4 flex justify-center gap-3"
          >
            {["🧱", "🌋"].map((emoji, i) => (
              <motion.span
                key={emoji}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: -24 - i * 8 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-2xl"
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        )}
      </motion.button>

      <Typography variant="label" className="normal-case tracking-normal">
        Tap the backpack to see all stories
      </Typography>

      <Button
        variant="soft"
        onClick={() => router.push("/backpack")}
        className={cn("w-full max-w-xs sm:w-auto", opening && "pointer-events-none opacity-50")}
      >
        See all stories
      </Button>
    </div>
  );
}
