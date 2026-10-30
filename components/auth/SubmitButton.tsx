import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";

type SubmitButtonProps = {
  pending: boolean;
  children: ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ pending, children, pendingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClass("primary", "md", "w-full")}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
