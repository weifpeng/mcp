import "dotenv/config";
import { TPMCPWalletAdapter } from "../src/tvm";
import { test } from "vitest";
import { TronWeb } from "tronweb";

test("test connect", { timeout: 300000 }, async () => {
  const adapter = new TPMCPWalletAdapter("1");
  const msg = await adapter.signMessage("hello");
});
