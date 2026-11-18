import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-950">Page Not Found</h1>
        <p className="text-sm text-gray-600">
          The blood request, profile, or page you were looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
