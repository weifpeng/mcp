"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ConnectWallet } from "./connect-wallet";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/explore", label: "Explore" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 justify-between items-center max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              MCP
            </Link>
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-2">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className="rounded-full font-medium"
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <ConnectWallet />
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
