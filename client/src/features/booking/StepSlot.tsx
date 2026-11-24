import { useEffect, useState, type Dispatch } from "react";
import { ErrorNotice } from "../../components/ui/ErrorNotice";
import { TextField } from "../../components/ui/FormFields";
import { formatDateLong, formatTime } from "../../lib/format";
import { addDaysToDate, isDateInRange, lagosDateString } from "../../lib/lagosDate";
import { slotParams, type BookingAction, type BookingDraft } from "./bookingDraft";
import { useSlots } from "./queries";

export const MAX_DAYS_AHEAD = 90; // [REPLACE] the owner decides how far ahead people can book (Q35)

type Props = { draft: BookingDraft; dispatch: Dispatch<BookingAction> };

export function StepSlot({ draft, dispatch }: Props) {
  // "Today" in Lagos, not on the customer's device
  const today = lagosDateString(Date.now());
  const last = addDaysToDate(today, MAX_DAYS_AHEAD);

  const dateOk = draft.date !== null && isDateInRange(draft.date, today, last);
  const query = useSlots(dateOk ? slotParams(draft) : null); // no request for a bad or empty date

  const [gone, setGone] = useState(false);
  // A refreshed list might no longer contain the time the customer chose (someone else took it)
  useEffect(() => {
    if (draft.slotStart && query.data && !query.data.some((slot) => slot.startAt === draft.slotStart)) {
      setGone(true);
      dispatch({ type: "chooseSlot", slotStart: null });
    }
  }, [query.data, draft.slotStart, dispatch]);

  const dateError =
    draft.date && !dateOk ? `Choose a date from today to ${formatDateLong(last)}.` : undefined;

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <TextField
          label="Date"
          type="date"
          min={today}
          max={last}
          value={draft.date ?? ""}
          error={dateError}
          onChange={(event) => {
            setGone(false);
            dispatch({ type: "chooseDate", date: event.target.value === "" ? null : event.target.value });
          }}
        />
      </div>

      {gone && (
        <p role="status" className="border-l-4 border-gold-deep pl-3 font-medium">
          That time is no longer free. Please choose another.
        </p>
      )}

      {dateOk && query.isPending && (
        <div aria-busy="true">
          <p className="sr-only" role="status">Loading times</p>
          <div aria-hidden="true" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="h-11 animate-pulse rounded-full bg-sand" />
            ))}
          </div>
        </div>
      )}

      {query.isError && <ErrorNotice error={query.error} onRetry={() => void query.refetch()} title="We could not load the times" />}

      {query.data && query.data.length === 0 && (
        <p role="status" className="max-w-prose">
          There are no free times on {formatDateLong(draft.date ?? today)}. Please try another day.
        </p>
      )}

      {query.data && query.data.length > 0 && (
        <fieldset>
          <legend className="font-medium">Free times on {formatDateLong(draft.date ?? today)}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {query.data.map((slot) => (
              <label key={slot.startAt}>
                {/* Picking a time sends nothing. It only changes state, so it is instant */}
                <input
                  type="radio"
                  name="slot"
                  value={slot.startAt}
                  checked={draft.slotStart === slot.startAt}
                  onChange={() => {
                    setGone(false);
                    dispatch({ type: "chooseSlot", slotStart: slot.startAt });
                  }}
                  className="peer sr-only"
                />
                <span
                  className={
                    "flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full border-2 border-cocoa px-2 " +
                    "peer-checked:bg-cocoa peer-checked:text-ivory " +
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-deep"
                  }
                >
                  {formatTime(slot.startAt)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}