"use client";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ArrowUp, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExploreBtn() {
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [open, setOpen] = useState(false);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);

  const models = ["GPT-4o", "Claude 3.5 Sonnet", "Claude 3 Opus"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button ref={dialogTriggerRef} className="flex items-center gap-2">
         ⌘+J to Start
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden">
        <DialogTitle />
        <textarea
          className="w-full p-6 bg-white resize-none min-h-[240px] focus:outline-none text-gray-700"
          placeholder="Explore something..."
          style={{ fontSize: "16px", lineHeight: "1.6" }}
        />
        <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex items-center">
            <Button type="button" variant="ghost" className="p-2 rounded-full ">
              <Settings className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  {selectedModel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model}
                    className="cursor-pointer"
                    onClick={() => setSelectedModel(model)}
                  >
                    {model}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              className="h-9 w-9 p-0 flex items-center justify-center rounded-full transition-colors shadow-sm"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
