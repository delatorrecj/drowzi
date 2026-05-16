"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

import { DEMO_BARCODE_VALUE } from "@/lib/demo/demoDefaults";
import { todayLocalDate } from "@/lib/demo/date";
import {
  listRegisteredBarcodes,
  recordHabitCompletion,
  registerBarcode,
} from "@/lib/demo/storage/db";
import type { Alarm, BarcodeHabitConfig } from "@/lib/demo/types";

type Props = {
  alarm?: Alarm;
  onVerified?: () => void;
};

export default function DemoBarcodeGate({ alarm, onVerified }: Props) {
  const expected =
    (alarm?.habitConfig as BarcodeHabitConfig | undefined)?.barcodeValue ?? DEMO_BARCODE_VALUE;

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "matched" | "error">("idle");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<string[]>([]);

  const finish = useCallback(async () => {
    setStatus("matched");
    if (alarm) {
      await recordHabitCompletion({
        alarmId: alarm.id,
        habitType: "barcode",
        success: true,
        method: "verified",
        localDate: todayLocalDate(),
      });
    }
    onVerified?.();
  }, [alarm, onVerified]);

  useEffect(() => {
    void listRegisteredBarcodes().then((rows) => setRegistered(rows.map((r) => r.value)));
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
        if (text === expected || registered.includes(text)) {
          controlsRef.current?.stop();
          void finish();
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
  }, [expected, registered, finish]);

  const registerDemo = async () => {
    await registerBarcode(expected, "Demo item");
    setRegistered((prev) => [...new Set([...prev, expected])]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#F4C430]">Barcode gate</h1>
        <p className="mt-2 font-body text-[#9A7A50]">
          Scan your registered item. Demo expects: <strong className="text-[#F5E6C8]">{expected}</strong>
        </p>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#4A3015] bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      </div>

      <p className="text-center font-body text-sm text-[#9A7A50]">
        Status: {status}
        {lastScan ? ` · Last: ${lastScan}` : ""}
      </p>

      {error && <p className="text-sm text-[#E63946]">{error}</p>}

      {status === "matched" && (
        <p className="rounded-xl bg-[#F4C430]/20 px-4 py-3 text-center font-display font-bold text-[#F4C430]">
          Barcode verified!
        </p>
      )}

      <button
        type="button"
        onClick={() => void registerDemo()}
        className="rounded-xl border border-[#4A3015] py-3 font-body text-sm text-[#9A7A50]"
      >
        Register demo barcode locally
      </button>
    </div>
  );
}
