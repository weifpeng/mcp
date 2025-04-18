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

export function tryDecodeHex(hex: string): string | null {
  try {
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = new Uint8Array(
      cleanHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || [],
    );
    const decoded = new TextDecoder().decode(bytes);
    const printableChars = decoded.replace(/[^\x20-\x7E]/g, "");
    if (printableChars.length > decoded.length * 0.7) {
      return decoded;
    }
    return null;
  } catch (e) {
    return null;
  }
}
