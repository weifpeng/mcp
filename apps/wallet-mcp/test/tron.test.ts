import { TronWeb } from "tronweb";
import { test } from "vitest";

test("test", async () => {
  const tron = new TronWeb({
    fullHost: "https://api.trongrid.io",
  });

  const transaction = await tron.transactionBuilder.sendTrx(
    "TXbGWKFrYvcW6949agfvVQvfjdU7ic4TpF",
    1000000,
    "TPCTgt1NXsGXE7JCiZoEghbJYHFni3DyeZ",
  );

  console.log(JSON.stringify(transaction));
});
