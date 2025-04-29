import "dotenv/config";

import { createTpWalletClient } from "../src";
import { describe, it, expect, test } from "vitest";
import { arbitrumSepolia } from "viem/chains";
import { generateKey, encrypt, decrypt } from "../src/encrypt";

describe("createTpWalletClient", { timeout: 300000 }, () => {
  it("should create a wallet client", async () => {
    const walletClient = createTpWalletClient({ chain: arbitrumSepolia });

    const address = await walletClient.getAddresses();

    const requestAddress = await walletClient.requestAddresses();
  });
});

// test("test encrypt", async () => {
//   const key = generateKey();
//   const data = JSON.stringify({method:"test"});
//   const encrypted = await encrypt(data, key);
//   const decrypted = await decrypt(encrypted, key);
//   expect(decrypted).toBe(data);
// });
