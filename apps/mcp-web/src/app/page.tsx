"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// Optimized animation variants with improved performance
const baseTransition = {
  type: "tween",
  duration: 0.3,
  ease: "easeOut"
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: baseTransition
  }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: baseTransition
  }
};

// Simplified staggered container animation
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Only enable animations after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Respect user's reduced motion preferences
  const getAnimationVariants = (variants: {
    hidden: object;
    visible: object;
    [key: string]: object;
  }) => {
    return shouldReduceMotion ? {} : variants;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mb-16">
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={getAnimationVariants(staggerContainerVariants)}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            variants={getAnimationVariants(fadeInUpVariants)}
          >
            Wallet MCP
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mb-8"
            variants={getAnimationVariants(fadeInUpVariants)}
          >
            The Simplest Way to Interact with Blockchain via Claude
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={getAnimationVariants(fadeInUpVariants)}
          >
            <Button size="lg" asChild>
              <Link href="/explore">Start Exploring</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/marketplace">View Examples</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={getAnimationVariants(fadeInVariants)}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          Core Features
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={getAnimationVariants(staggerContainerVariants)}
        >
          {[
            { id: "wallet-connection", title: "Wallet Connection", description: "Securely connect your crypto wallet, supporting both Solana and EVM networks. Make transactions without leaving Claude." },
            { id: "sign-transactions", title: "Sign Transactions", description: "Easily sign and send transactions with Claude guiding you through each step, ensuring security and transparency." },
            { id: "blockchain-operations", title: "Blockchain Operations", description: "Seamlessly integrate with other MCP capabilities to perform various blockchain operations, from token swaps to NFT minting and DeFi interactions." }
          ].map((feature) => (
            <motion.div 
              key={feature.id}
              variants={getAnimationVariants(fadeInUpVariants)}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              className="h-full"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Claude Configuration Section */}
      <motion.section 
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={getAnimationVariants(fadeInVariants)}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          How to Configure Claude
        </motion.h2>
        <motion.div 
          className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          <motion.ol 
            className="space-y-6"
            variants={getAnimationVariants(staggerContainerVariants)}
          >
            {[
              { id: "step1", step: 1, title: "Download Claude for Desktop", description: "Start by downloading Claude for Desktop, choosing either macOS or Windows. If you already have Claude for Desktop, make sure it's on the latest version by clicking on the Claude menu on your computer and selecting \"Check for Updates…\"" },
              { id: "step2", step: 2, title: "Configure the Wallet MCP Server", description: "Open the Claude menu on your computer and select \"Settings…\" Then click on \"Developer\" in the left-hand bar and click \"Edit Config\". This will open your configuration file. Add the Wallet MCP server configuration to the file:" },
              { id: "step3", step: 3, title: "Restart Claude", description: "After updating your configuration file, restart Claude for Desktop. Upon restarting, you should see a hammer icon in the bottom right corner of the input box. After clicking on it, you should see the wallet tools available." },
              { id: "step4", step: 4, title: "Try it out!", description: "You can now talk to Claude and ask it to interact with your wallet. As needed, Claude will call the relevant tools and seek your approval before taking any blockchain action." }
            ].map((item) => (
              <motion.li 
                key={item.id}
                className="flex gap-4"
                variants={getAnimationVariants(fadeInUpVariants)}
              >
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                  {item.step === 2 && (
                    <div className="bg-slate-900 text-slate-50 p-4 rounded-md mt-3 font-mono text-sm overflow-auto">
                      {`{
  "mcpServers": {
    "wallet-mcp": {
      "command": "npx",
      "args": [
        "wallet-mcp"
      ]
    }
  }
}`}
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ol>

          <motion.div 
            className="mt-8 pt-6 border-t border-gray-200"
            variants={getAnimationVariants(fadeInVariants)}
          >
            <h3 className="font-semibold text-lg mb-3">Troubleshooting</h3>
            <motion.div 
              className="space-y-4"
              variants={getAnimationVariants(staggerContainerVariants)}
            >
              <motion.div
                variants={getAnimationVariants(fadeInUpVariants)}
              >
                <h4 className="font-medium mb-1">
                  Server not showing up in Claude / hammer icon missing
                </h4>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Restart Claude for Desktop completely</li>
                  <li>Check your configuration file syntax</li>
                  <li>Make sure Node.js is installed on your computer</li>
                  <li>
                    Try manually running the server to see if you get any errors
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={getAnimationVariants(fadeInUpVariants)}
              >
                <h4 className="font-medium mb-1">
                  Tool calls failing silently
                </h4>
                <ul className="list-disc pl-5 text-gray-600">
                  <li>Check Claude's logs for errors</li>
                  <li>Verify your server runs without errors</li>
                  <li>Try restarting Claude for Desktop</li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Example Commands Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={getAnimationVariants(fadeInVariants)}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          Example Commands
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          variants={getAnimationVariants(staggerContainerVariants)}
        >
          {[
            { id: "create-token", title: "Create Token", command: "Please help me create a Solana token named \"MyToken\" with an initial supply of 10000" },
            { id: "send-assets", title: "Send Assets", command: "Please help me send 0.01 SOL to address ABC123..." },
            { id: "check-balance", title: "Check Balance", command: "Check my wallet balance" },
            { id: "sign-message", title: "Sign Message", command: "Please help me sign the message \"Verify my identity\"" }
          ].map((item) => (
            <motion.div
              key={item.id}
              variants={getAnimationVariants(fadeInUpVariants)}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-3 rounded hover:bg-blue-50 transition-colors duration-200">
                    <p className="font-mono text-sm">
                      {item.command}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Community Section */}
      <motion.section 
        className="my-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={getAnimationVariants(fadeInVariants)}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-10"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          Join Our Community
        </motion.h2>
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          variants={getAnimationVariants(fadeInUpVariants)}
        >
          <p className="text-xl mb-6">
            Connect with other Wallet MCP users, get help, and stay updated on the latest features.
          </p>
          <Button size="lg" className="flex items-center gap-2" asChild>
            <Link href="https://t.me/walletmcp" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send" aria-hidden="true">
                <title>Telegram icon</title>
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              Join our Telegram Group
            </Link>
          </Button>
        </motion.div>
      </motion.section>
    </div>
  );
}
