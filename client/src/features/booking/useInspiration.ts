import { useEffect, useRef, useState } from "react";
import { useUploadInspiration } from "./queries";
import { validateInspirationFile } from "./inspirationFile";

// All the photo state in one place. It lives in the wizard, so going Back keeps the photo
export function useInspiration() {
  const upload = useUploadInspiration();
  const [url, setUrl] = useState<string | null>(null); // the hosted photo, sent with the booking
  const [preview, setPreview] = useState<string | null>(null); // a local copy to show at once
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Each choice gets a number. A slow upload that finishes after "Remove" is ignored
  const attempt = useRef(0);

  // The browser keeps a preview in memory until we release it: when it is replaced, and on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function choose(file: File) {
    const problem = validateInspirationFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    const mine = ++attempt.current;
    setError(null);
    setUrl(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    upload.mutate(file, {
      onSuccess: (result) => {
        if (mine !== attempt.current) return;
        setUrl(result.url);
        setUploading(false);
      },
      onError: (failure) => {
        if (mine !== attempt.current) return;
        setPreview(null);
        setUploading(false);
        setError(failure instanceof Error && failure.message ? failure.message : "We could not upload that photo. Try another one.");
      },
    });
  }

  function remove() {
    attempt.current += 1; // forget any upload still on its way
    setUrl(null);
    setPreview(null);
    setUploading(false);
    setError(null);
  }

  return { url, preview, uploading, error, choose, remove };
}

export type InspirationState = ReturnType<typeof useInspiration>;