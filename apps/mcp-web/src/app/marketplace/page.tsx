"use client";
import { ArrowUp, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Explore() {
  const [selectedModel, setSelectedModel] = useState("GPT-4o");

  const models = ["GPT-4o", "Claude 3.5 Sonnet", "Claude 3 Opus"];

  return (
    <div className="flex justify-center w-full   p-6">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>
      </div>
    </div>
  );
}
