"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ConnectWallet } from "./connect-wallet";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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
              Wallet MCP
            </Link>
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
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
          <div className="flex items-center gap-2">
            <ConnectWallet />
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col gap-4 py-4">
                  <Link
                    href="/"
                    className="font-bold text-xl mb-4"
                  >
                    Wallet MCP
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            pathname === item.href
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
