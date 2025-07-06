import { LoadingSpinner } from "./loading-spinner";

export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <LoadingSpinner className="h-10 w-10 text-white" />
      <p className="mt-4 text-lg text-white">{text}</p>
    </div>
  );
} 