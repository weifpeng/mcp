"use client";
import { ExploreBtn } from "@/components/explore-btn";
import { useEffect } from "react";

export default function Explore() {
  useEffect(() => {
    fetch("http://localhost:3000/trpc/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: "123",
      }),
      credentials: "include",
    });
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
          Explore the Crypto Universe with AI
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Discover blockchain technology, cryptocurrencies, and DeFi through an
          AI-guided experience. Ask any questions and get personalized insights
          to navigate the crypto world safely and confidently.
        </p>
        <div className="flex justify-center">
          <ExploreBtn />
        </div>
      </div>
    </div>
  );
}
