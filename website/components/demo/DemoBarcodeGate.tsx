"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

import { DEMO_BARCODE_VALUE } from "@/lib/demo/demoDefaults";
import { demoTheme } from "@/lib/demo/demoTheme";
import { useDemoGateCompletion } from "@/lib/demo/hooks/useDemoGateCompletion";
import { listRegisteredBarcodes, registerBarcode } from "@/lib/demo/storage/db";
import type { Alarm, BarcodeHabitConfig } from "@/lib/demo/types";

// Require this many consecutive decodes of the expected value before accepting.
// ponytail: 2-frame confirm; bump if false accepts persist.
const CONFIRM_FRAMES = 2;

type Props = {
  alarm?: Alarm;
  onVerified?: () => void;
};

export default function DemoBarcodeGate({ alarm, onVerified }: Props) {
  const expected =
    (alarm?.habitConfig as BarcodeHabitConfig | undefined)?.barcodeValue ?? DEMO_BARCODE_VALUE;

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  // Ref (not state) so registering a barcode doesn't tear down the scanner.
  const registeredRef = useRef<string[]>([]);
  const confirmRef = useRef(0);
  const [status, setStatus] = useState<"idle" | "scanning" | "error">("idle");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { done, finish } = useDemoGateCompletion(alarm, "barcode", onVerified);

  useEffect(() => {
    void listRegisteredBarcodes().then((rows) => {
      registeredRef.current = rows.map((r) => r.value);
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reader = new BrowserMultiFormatReader();
    setStatus("scanning");

    void reader.decodeFromVideoDevice(undefined, video, (result, err) => {
      if (result) {
        const text = result.getText();
        setLastScan(text);
        const ok = text === expected || registeredRef.current.includes(text);
        if (ok) {
          setMismatch(false);
          confirmRef.current += 1;
          if (confirmRef.current >= CONFIRM_FRAMES) {
            controlsRef.current?.stop();
            void finish();
          }
        } else {
          confirmRef.current = 0;
          setMismatch(true);
        }
      }
      if (err && !String(err).includes("NotFoundException")) {
        setError(String(err));
      }
    }).then((controls) => {
      controlsRef.current = controls;
    });

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [expected, finish]);

  const registerDemo = async () => {
    await registerBarcode(expected, "Demo item");
    if (!registeredRef.current.includes(expected)) registeredRef.current.push(expected);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 bg-black">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
        <Viewfinder />
        <div className="pointer-events-none absolute inset-x-0 top-[32%] h-px animate-scan-line bg-primary/80 shadow-[0_0_8px_#F4C430]" />
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 rounded-lg bg-white/95 px-3 py-2 shadow-lg">
          <p className="text-center font-display text-[10px] font-bold text-text-dark">Aim at item</p>
        </div>
      </div>

      <div
        className="shrink-0 border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          borderColor: demoTheme.border,
          background: "linear-gradient(180deg, #0F0A05 0%, #1A1209 100%)",
        }}
      >
        <p className="font-display text-lg font-extrabold text-text">Scan to dismiss</p>
        <p className="mt-1 font-body text-xs text-text-muted">
          Expected: <span className="text-text">{expected}</span>
        </p>
        <p className="mt-2 font-body text-[10px] text-text-muted">
          Status: {done ? "matched" : status}
          {lastScan ? ` · Last: ${lastScan}` : ""}
        </p>

        {done && (
          <p className="mt-2 rounded-lg bg-primary/20 px-3 py-2 text-center font-display text-xs font-bold text-primary">
            Barcode verified!
          </p>
        )}

        {!done && mismatch && (
          <p className="mt-2 rounded-lg bg-alarm/20 px-3 py-2 text-center font-display text-xs font-bold text-alarm">
            Different code — keep scanning the right item.
          </p>
        )}

        {error && <p className="mt-2 text-xs text-alarm">{error}</p>}

        <button
          type="button"
          onClick={() => void registerDemo()}
          className="mt-3 w-full rounded-xl border py-2.5 font-body text-xs text-text-muted"
          style={{ borderColor: demoTheme.border }}
        >
          Register demo barcode locally
        </button>
      </div>
    </div>
  );
}

function Viewfinder() {
  return (
    <div className="pointer-events-none absolute inset-8">
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute h-5 w-5 border-2 border-primary ${
            pos === "tl"
              ? "left-0 top-0 border-b-0 border-r-0 rounded-tl-md"
              : pos === "tr"
                ? "right-0 top-0 border-b-0 border-l-0 rounded-tr-md"
                : pos === "bl"
                  ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-md"
                  : "bottom-0 right-0 border-l-0 border-t-0 rounded-br-md"
          }`}
        />
      ))}
    </div>
  );
}
