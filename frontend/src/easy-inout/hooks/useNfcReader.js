import { useState, useCallback, useRef } from "react";

/**
 * Wraps the browser's Web NFC API (NDEFReader) — supported today on
 * Chrome for Android over HTTPS. Once armed, every physical card tap fires
 * onTag automatically within milliseconds, no button press needed.
 * Falls back gracefully (supported=false) on desktop/iOS.
 */
export function useNfcReader(onTag) {
  const [supported] = useState(typeof window !== "undefined" && "NDEFReader" in window);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const readerRef = useRef(null);

  const start = useCallback(async () => {
    if (!supported) return;
    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      readerRef.current = ndef;
      setScanning(true);
      setError(null);
      ndef.onreading = (event) => {
        const serial = (event.serialNumber || "").replace(/:/g, "").toUpperCase();
        onTag(serial);
      };
      ndef.onreadingerror = () => setError("Could not read card. Hold it steady near the top-back of the phone.");
    } catch (err) {
      setError(err?.message || "NFC permission denied");
      setScanning(false);
    }
  }, [supported, onTag]);

  return { supported, scanning, error, start };
}
