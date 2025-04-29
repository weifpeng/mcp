import type { NetworkType } from "@/components/connect-wallet-v2/type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTpExtensionInstall() {
  return "tokenpocket" in globalThis;
}

export async function buildConnectMessage(param: {
  address: string;
  network: NetworkType;
  chainId: string | number;
  uuid: string;
}) {
  const domain = "https://mcp.tp.xyz/";
  const chain = CHAIN_LIST.find((c) => c.id === param.chainId);
  if (!chain) {
    throw new Error("Chain not found");
  }

  const nonce = Math.random().toString(36).substring(2);
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const message = {
    address: param.address,
    network: param.network,
    chainId: param.chainId,
    uuid: param.uuid,
    statement: `${domain} wants you to sign in with your ${chain.name} account`,
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
