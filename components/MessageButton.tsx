"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Opening..." : "Message"}
    </button>
  );
}

export default function MessageButton({
  action,
}: {
  action: () => void | Promise<void>;
}) {
  return (
    <form action={action} className="w-full sm:w-auto">
      <SubmitButton />
    </form>
  );
}
