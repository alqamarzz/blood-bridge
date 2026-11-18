import { Heart } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red-100 animate-ping opacity-60" />
        <div className="absolute w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
          <Heart className="w-6 h-6 fill-current" />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-500 animate-pulse">
        Loading BloodBridge...
      </p>
    </div>
  );
}
