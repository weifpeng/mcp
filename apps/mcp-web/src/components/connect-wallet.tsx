import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

export function ConnectWallet() {
  return (
    <Button variant="outline" size="sm" className="rounded-full">
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
