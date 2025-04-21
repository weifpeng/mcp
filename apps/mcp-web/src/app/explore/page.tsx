"use client";
import { ExploreBtn } from "@/components/explore-btn";

export default function Explore() {
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
