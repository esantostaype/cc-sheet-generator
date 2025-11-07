import { HugeiconsIcon } from "@hugeicons/react";
import { NoteAddIcon } from "@hugeicons/core-free-icons";

interface Props {
  isActive?: boolean;
}

export const SpinnerCreatingTask = ({ isActive }: Props) => {
  return (
    <div
      className={`absolute top-0 left-0 h-dvh w-full flex items-center justify-center transition-all ${
        isActive ? "opacity-100 visible" : "opacity-0 invisible"
      } z-[99999]`}
    >
      <div className="z-20 relative flex flex-col items-center gap-2">
        <div className="relative">
          <svg
            aria-hidden="true"
            className="size-18 animate-spin text-accent"
            viewBox="0 0 50 50"
            fill="none"
          >
            <circle
              className="text-gray-700"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M45 25a20 20 0 00-20-20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300">
            <HugeiconsIcon icon={NoteAddIcon} size={32} strokeWidth={1.5} />
          </div>
        </div>
        <div>Creating Task...</div>
      </div>
      <span className="absolute z-10 h-dvh w-full bg-background opacity-80 top-0 left-0"></span>
    </div>
  );
};
