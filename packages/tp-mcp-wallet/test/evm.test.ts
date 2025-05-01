import "dotenv/config";

import { createTpMCPEvmWalletClient } from "../src";
import { describe, it, expect, test } from "vitest";
import { arbitrumSepolia } from "viem/chains";
import { generateKey, encrypt, decrypt } from "../src/encrypt";

describe("createTpWalletClient", { timeout: 300000 }, () => {
  it("should create a wallet client", async () => {
    const walletClient = createTpMCPEvmWalletClient({ chain: arbitrumSepolia });

    const address = await walletClient.getAddresses();

    const requestAddress = await walletClient.requestAddresses();
  });
});



 