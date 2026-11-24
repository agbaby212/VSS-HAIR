import { useRef } from "react";
import type { InspirationState } from "../../features/booking/useInspiration";
import { Button } from "../ui/Button";

export function InspirationUpload({ state }: { state: InspirationState }) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The local preview first, then the hosted photo (after going Back and returning, only the hosted one is left)
  const shown = state.preview ?? state.url;

  return (
    <fieldset>
      <legend className="mb-1 text-xl">Inspiration photo (optional)</legend>
      <p className="max-w-prose">Show us the look you want. JPG, PNG or WebP, up to 5 MB.</p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {shown && (
          // Circle: our signature shape. Explicit width and height stop the page from jumping
          <img src={shown} alt="Your inspiration photo" width={96} height={96} className="h-24 w-24 rounded-full border-2 border-gold object-cover" />
        )}

        {/* The real file input is hidden. The button below opens it, so keyboard users get a normal button */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) state.choose(file);
            event.target.value = ""; // lets the same file be chosen again
          }}
        />
        <Button type="button" variant="secondary" disabled={state.uploading} onClick={() => inputRef.current?.click()}>
          {shown ? "Choose another photo" : "Choose a photo"}
        </Button>
        {shown && !state.uploading && (
          <button type="button" onClick={state.remove} className="text-gold-deep underline underline-offset-4">
            Remove photo
          </button>
        )}
      </div>

      {/* role="status": the result is read aloud */}
      <p role="status" className="mt-2">
        {state.uploading ? "Uploading your photo..." : state.url ? "Photo added." : ""}
      </p>
      {state.error && (
        <p role="alert" className="mt-2 font-medium">
          {state.error}
        </p>
      )}
    </fieldset>
  );
}