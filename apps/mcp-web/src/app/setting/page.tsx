"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { getSetting, setSetting } from "@/lib/storage";
import { toast } from "sonner";

export default function Setting() {
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [anthropicApiUrl, setAnthropicApiUrl] = useState(
    "https://api.anthropic.com",
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load existing settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const savedSettings = getSetting();
        if (savedSettings?.model) {
          const anthropicModel = savedSettings.model.find(
            (m) => m.type === "anthropic",
          );
          if (anthropicModel) {
            setAnthropicApiKey(anthropicModel.apiKey);
            setAnthropicApiUrl(anthropicModel.apiUrl);
            toast.success("Settings loaded successfully");
          }
        }
      } catch (error) {
        // More specific error handling
        if (error instanceof SyntaxError) {
          console.error("Invalid JSON in stored settings", error);
        } else if (error instanceof Error) {
          console.error(`Error loading settings: ${error.message}`);
        } else {
          console.error("Unknown error loading settings", error);
        }
        // Only show error toast if it's not just that settings don't exist yet
        if (error instanceof Error && !error.message.includes("Invalid")) {
          toast.error("Failed to load settings");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveModelConfiguration = () => {
    try {
      // Create the settings object according to the schema
      const settings = {
        model: [
          {
            type: "anthropic" as const,
            apiKey: anthropicApiKey,
            apiUrl: anthropicApiUrl,
          },
        ],
      };

      // Save to localStorage
      setSetting(settings);
      toast.success("API configuration saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 min-h-[calc(100vh-68px)] py-6">
      {/* Left sidebar */}
      <div className="md:border-r md:pr-6 h-full">
        <div className="space-y-4 sticky top-0">
          <h3 className="text-sm font-medium mt-2">Settings</h3>
          <nav className="flex flex-col space-y-2">
            <Button variant="secondary" className="justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Model Configuration
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6 py-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Model Configuration
        </h1>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Anthropic API Configuration</CardTitle>
            <CardDescription>
              Enter your Anthropic API key to use Claude models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anthropic-api-key">API Key</Label>
              <Input
                id="anthropic-api-key"
                type="password"
                placeholder="Enter your Anthropic API key"
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-options">
                <AccordionTrigger className="py-2">Advanced Options</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-api-url">API URL</Label>
                    <Input
                      id="anthropic-api-url"
                      placeholder="Enter custom API URL"
                      value={anthropicApiUrl}
                      onChange={(e) => setAnthropicApiUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button 
              onClick={saveModelConfiguration} 
              disabled={isLoading}
            >
              Save API Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
