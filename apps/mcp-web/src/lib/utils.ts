import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTpExtensionInstall() {
  return "tokenpocket" in globalThis;
}

export async function buildConnectMessage(account: string) {
  const domain = "@tokenpocket/mcp";
  const address = account;

  const nonce = Math.random().toString(36).substring(2);
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const message = {
    address,
    statement: `${domain} wants you to sign in with your Solana account`,
    nonce,
    issuedAt,
    expirationTime,
  };

  return JSON.stringify(message);
}
