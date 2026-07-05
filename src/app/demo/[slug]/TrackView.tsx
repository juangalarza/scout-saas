"use client";

import { useEffect } from "react";

export default function TrackView({ demoId }: { demoId: string }) {
  useEffect(() => {
    fetch("/api/demo-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demoId }),
    }).catch(() => {
      // el tracking es best-effort: si falla, no debe romper la demo
    });
  }, [demoId]);

  return null;
}
