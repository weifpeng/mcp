"use client";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface SuccessAndCloseProps {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
}

export default function SuccessAndClose({
  title,
  description,
}: SuccessAndCloseProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white sm:bg-gray-100">
      <div className="flex items-center justify-center min-h-screen px-6 py-8 sm:p-8">
        <div className="w-full max-w-md sm:bg-white sm:shadow-lg sm:rounded-2xl sm:p-8">
          <main className="flex flex-col gap-8 sm:gap-[32px] items-center">
            <div className="relative ">
              <CheckCircleIcon className=" size-16 text-green-500" />
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {description}
              </p>
              <p className="text-gray-500 text-sm">
                {countdown} seconds to close...
              </p>
            </div>

            <div
              className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
              onClick={() => {
                window.close();
              }}
            >
              Start
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
