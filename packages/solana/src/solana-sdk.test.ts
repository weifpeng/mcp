import "dotenv/config";
import { z } from "zod";
import { buildConnectMessage, SolanaSDK, verifySignature } from "./index.js";
import * as nacl from "tweetnacl";

import {
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Decimal } from "decimal.js";
import fs from "node:fs";
import { beforeEach, describe, expect, test } from "vitest";

const testConfigSchema = z.object({
  RPC_URL: z.string(),
  PRIVATE_KEY: z.string(),
  HELIUS_API_KEY: z.string(),
  USDC_ADDRESS: z.string(),
});

const testConfig = testConfigSchema.parse(process.env);

const TOKEN_ADDRESS = "AfVVmY8N9kjwCQnV4yFRBYMJvFNb2W6dBfwNN1vUXP7r";

test("verify signature", { timeout: 1000 * 60 * 10 }, async () => {
  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );
  const message = await buildConnectMessage({
    account: adminPayer.publicKey.toBase58(),
    domain: "test",
    statement: "test",
  });

  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, adminPayer.secretKey);

  const isValid = await verifySignature({
    signature: Buffer.from(signature).toString("hex"),
    message,
    address: adminPayer.publicKey.toBase58(),
  });

  expect(isValid).toBe(true);
});

test("create token instruction", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const instruction = await solana.buildCreateMintTransactionInstruction({
    from: adminPayer.publicKey,
    name: "test",
    symbol: "test",
    decimals: 6,
  });

  const latestBlockhash = await solana.connection.getLatestBlockhash();

  const tx = solana.buildTransaction({
    instructions: [...instruction],
    addressLookupTableAddresses: [],
    blockhash: latestBlockhash.blockhash,
    feePayer: adminPayer,
  });

  tx.sign([adminPayer]);

  const serializedTx = tx.serialize();

  console.log(serializedTx);
});

test("create token", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const tokenInfo = await solana.createToken({
    from: adminPayer,
    name: "test",
    symbol: "test",
    decimals: 6,
    initialSupply: 1000000,
    imageUrl:
      "https://storage.googleapis.com/storage.catbird.ai/predictions/257313940344803328/71e8c58f-988d-4455-bcb5-d1d15a4d55f9.png",
  });

  console.log(tokenInfo);
});

test("send token", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const from = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const toKeyPair = Keypair.generate();
  const to = toKeyPair.publicKey;
  // const to = new PublicKey("2HuojpCGomMmbfuRmbo99ruVz5mHzoUMmWzmDWMgxVPx");

  const toAccount = await solana.getTokenAccount({
    tokenAddress: TOKEN_ADDRESS,
    owner: to.toBase58(),
  });

  expect(toAccount).toBeNull();

  const result = await solana.sendToken({
    to: to.toBase58(),
    from: from,
    amount: new Decimal(1 * 10 ** 9).toString(),
    tokenAddress: TOKEN_ADDRESS,
    memo: "test",
  });

  console.log(result);

  expect(result).toBeDefined();

  const toAccountAfter = await solana.getTokenAccount({
    tokenAddress: TOKEN_ADDRESS,
    owner: to.toBase58(),
  });

  expect(toAccountAfter).not.toBeNull();
});

test("transaction fee", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const to = Keypair.generate();

  const result = await solana.calcTransactionFee({
    to: to.publicKey.toBase58(),
    amount: new Decimal(1 * 10 ** 9).toString(),
    tokenAddress: TOKEN_ADDRESS,
  });

  console.log(result);
});

test("calculate account rent", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const rent = await solana.calculateAccountRent();
  console.log(rent);
  expect(rent).toBeGreaterThan(0);
});

test("get sol price", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const price = await solana.getSolPrice();
  console.log(price);

  expect(price).toBeGreaterThan(0);
});

test("calculateFeeByUsdc", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const to = Keypair.generate();

  console.log(to.publicKey.toBase58());

  const result = await solana.calculateFeeByUsdc({
    to: "4MhQkz3QpGomDwEwYMWYxejJE7ByYBqGBa2XGPH15Vvt",
    amount: 1 * 10 ** 9,
    tokenAddress: TOKEN_ADDRESS,
  });
  console.log(result);
});

test("getAddressTokenList", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const mintWallet = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const result = await solana.getAddressTokenList(
    mintWallet.publicKey.toBase58(),
  );

  const balance = await solana.getTokenAccountBalance({
    tokenAccountAddress: result[2].tokenAccountAddress,
  });
  const tokenInfo = await solana.getTokenInfo(balance.mint.toBase58());
  expect(tokenInfo.name).toBe("");
});

test("getSolBalance", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const balance = await solana.getSolBalance(
    "2HuojpCGomMmbfuRmbo99ruVz5mHzoUMmWzmDWMgxVPx",
  );
  console.log(balance);
});

test("getPriceByToken", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const price = await solana.getPriceByToken([
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt11",
    "So11111111111111111111111111111111111111112",
  ]);
  console.log(price);
});

test("token swap", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const from = Keypair.fromSecretKey(
    new Uint8Array(
      bs58.decode(
        "5JLEJKM8mVdbdaUFEpZyj8a2sT2ZzX8VvXLRLMQwUr8QW1T768E3d2J6fJVnqkNQbaZv76b2F41j9CKo4ucgXL9z",
      ),
    ),
  );

  const to = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const { instructions: transactionInstructionList, lookupTableAddresses } =
    await solana.buildTokenSwapTransactionInstruction({
      from: from.publicKey.toBase58(),
      to: "AKLVMDGNFFirUZnkKUZP3koxS7wJfxnL8gwy2W92jFSi",
      amount: new Decimal(1 * 10 ** 6).toString(),
      inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      outputMint: "So11111111111111111111111111111111111111112",
      feePayer: from.publicKey,
    });

  const unwarpSol = createCloseAccountInstruction(
    new PublicKey(from.publicKey.toBase58()),
    new PublicKey(from.publicKey.toBase58()),
    from.publicKey,
  );

  const feePayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const addressLookupTableAddresses =
    await solana.getAddressLookupTableAccounts(lookupTableAddresses);

  console.log(lookupTableAddresses, addressLookupTableAddresses);

  const blockhash = await solana.connection.getLatestBlockhash();
  const transaction = new TransactionMessage({
    payerKey: feePayer.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: transactionInstructionList,
  }).compileToV0Message(addressLookupTableAddresses);

  console.log(transaction);

  const versionedTransaction = new VersionedTransaction(transaction);
  console.log(feePayer.publicKey.toBase58(), from.publicKey.toBase58());
  console.log(versionedTransaction);

  versionedTransaction.sign([feePayer]);
  // versionedTransaction.sign([from]);

  const rawTransaction = versionedTransaction.serialize();

  const resignedTransaction = VersionedTransaction.deserialize(rawTransaction);
  resignedTransaction.sign([from]);

  console.log(resignedTransaction);

  const signature = await solana.connection.sendRawTransaction(
    resignedTransaction.serialize(),
    {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    },
  );

  // 等待确认
  await solana.connection.confirmTransaction({
    signature,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  });

  console.log(signature);
});

test.skip("send token", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  // 账户无 sol
  // 对方账务无 ata
  // 账户有 sol
  // 对方账户有 ata
  const from = Keypair.generate();
  const to = Keypair.generate();
  const to2 = Keypair.generate();
  const from2 = Keypair.generate();

  const getUsdcBalance = async (account: string) => {
    const ataAccount = getAssociatedTokenAddressSync(
      new PublicKey(usdc),
      new PublicKey(account),
    );
    const balance = await solana.getTokenAccountBalance({
      tokenAccountAddress: ataAccount.toBase58(),
    });
    return new Decimal(balance.amount.toString()).div(new Decimal(10 ** 6));
  };

  // from 无 sol 对方账户无 ata
  await solana.sendToken({
    from: adminPayer,
    to: from.publicKey.toBase58(),
    amount: new Decimal(0.4 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));

  expect((await getUsdcBalance(from.publicKey.toBase58())).eq(0.4)).toBe(true);

  const transaction = await solana.sendToken({
    from,
    to: to.publicKey.toBase58(),
    amount: new Decimal(0.1 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const [fromBalance, toBalance] = await Promise.all([
    getUsdcBalance(from.publicKey.toBase58()),
    getUsdcBalance(to.publicKey.toBase58()),
  ]);
  expect(fromBalance.lt(0.3)).toBe(true);
  expect(toBalance.eq(0.1)).toBe(true);
  console.log(transaction);
  console.log(
    `from: ${from.publicKey.toBase58()} ${fromBalance.toString()} to: ${to.publicKey.toBase58()} ${toBalance.toString()}  `,
  );

  // from 有 sol 对方有 ata
  await solana.sendSol({
    from: adminPayer,
    to: from.publicKey.toBase58(),
    amount: new Decimal(0.005 * 10 ** 9).toString(),
  });
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const fromSolBalance = await solana.getSolBalance(from.publicKey.toBase58());
  expect(fromSolBalance).toBeGreaterThan(0);
  const adminPayerSolBalance = await solana.getSolBalance(
    adminPayer.publicKey.toBase58(),
  );

  const sol2AtaTransaction = await solana.sendToken({
    from,
    to: to.publicKey.toBase58(),
    amount: new Decimal(0.1 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });
  console.log(sol2AtaTransaction);
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const [fromBalance2, toBalance2] = await Promise.all([
    getUsdcBalance(from.publicKey.toBase58()),
    getUsdcBalance(to.publicKey.toBase58()),
  ]);
  expect(fromBalance2.lt(0.1)).toBe(true);
  expect(toBalance2.eq(0.1)).toBe(true);

  // 账户有 sol 对方 无 ata
  const sol2NoneAtaTransaction = await solana.sendToken({
    from,
    to: to2.publicKey.toBase58(),
    amount: new Decimal(0.1 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });
  console.log(sol2NoneAtaTransaction);

  // 账户无 sol 对方 有 ata
  await solana.sendToken({
    from: adminPayer,
    to: from2.publicKey.toBase58(),
    amount: new Decimal(0.1 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });

  const noneSol2AtaTransaction = await solana.sendToken({
    from: from2,
    to: to2.publicKey.toBase58(),
    amount: new Decimal(0.1 * 10 ** 6).toString(),
    tokenAddress: usdc,
  });
  console.log(noneSol2AtaTransaction);
});

describe("send token", { sequential: true }, () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const getUsdcBalance = async (account: string) => {
    const ataAccount = getAssociatedTokenAddressSync(
      new PublicKey(usdc),
      new PublicKey(account),
    );
    const balance = await solana.getTokenAccountBalance({
      tokenAccountAddress: ataAccount.toBase58(),
    });
    return balance.amount;
  };

  const writePrivateKey = (keypair: Keypair) => {
    fs.mkdirSync("./private-key", { recursive: true });
    fs.writeFileSync(
      `./private-key/${keypair.publicKey.toBase58()}.txt`,
      bs58.encode(keypair.secretKey),
    );
  };

  // 3FTLPiYAYR4hqMNjgzpJv5oACCMHn41u2VUVaa3FVJNV
  const from = Keypair.fromSecretKey(
    new Uint8Array(
      bs58.decode(
        "hGhG2aerwEg8WUyioSyiKp739saJEftJucy1hDskUJuQcTUYKbbzTTyKm53n7aNLyEHqGffwmGyzSPwPKwnrJsK",
      ),
    ),
  );

  // 21GBZFUQeYLMW4xWYnseieDmoVx9TRbNfHBT4i9rRWCS
  const to = Keypair.fromSecretKey(
    new Uint8Array(
      bs58.decode(
        "5qMnpP3E1LpA1S28yZHW3xStRDG9Q8ciTFUZLDH2t9TwvoEksPN6MFuHTZgvgzTM5JeyXYkqFtYvAVTZNHfQnsRC",
      ),
    ),
  );

  const clearFromAndToAccount = async () => {
    const [fromBalance, toBalance] = await Promise.all([
      getUsdcBalance(from.publicKey.toBase58()).catch((e) => 0),
      getUsdcBalance(to.publicKey.toBase58()).catch((e) => 0),
    ]);

    const instruction = [
      ...solana.buildTokenTransferTransactionInstruction({
        from: from.publicKey.toBase58(),
        to: adminPayer.publicKey.toBase58(),
        amount: fromBalance.toString(),
        tokenAddress: usdc,
        feePayer: adminPayer.publicKey,
      }),
      ...solana.buildTokenTransferTransactionInstruction({
        from: to.publicKey.toBase58(),
        to: adminPayer.publicKey.toBase58(),
        amount: toBalance.toString(),
        tokenAddress: usdc,
        feePayer: adminPayer.publicKey,
      }),
      ...solana.buildCloseTokenAccountInstruction({
        account: new PublicKey(from.publicKey.toBase58()),
        tokenAddress: new PublicKey(usdc),
        destination: new PublicKey(adminPayer.publicKey.toBase58()),
      }),
      ...solana.buildCloseTokenAccountInstruction({
        account: new PublicKey(to.publicKey.toBase58()),
        tokenAddress: new PublicKey(usdc),
        destination: new PublicKey(adminPayer.publicKey.toBase58()),
      }),
    ];

    const [fromSolBalance, toSolBalance] = await Promise.all([
      solana.getSolBalance(from.publicKey.toBase58()),
      solana.getSolBalance(to.publicKey.toBase58()),
    ]);

    if (fromSolBalance > 0) {
      instruction.push(
        ...solana.buildSendSolTransactionInstruction({
          from: from,
          to: adminPayer.publicKey.toBase58(),
          amount: fromSolBalance.toString(),
        }),
      );
    }

    if (toSolBalance > 0) {
      instruction.push(
        ...solana.buildSendSolTransactionInstruction({
          from: to,
          to: adminPayer.publicKey.toBase58(),
          amount: toSolBalance.toString(),
        }),
      );
    }

    const blockhash = await solana.connection.getLatestBlockhash();

    const clearTransaction = solana.buildTransaction({
      instructions: instruction,
      addressLookupTableAddresses: [],
      blockhash: blockhash.blockhash,
      feePayer: adminPayer,
    });

    clearTransaction.sign([adminPayer]);
    clearTransaction.sign([from]);
    clearTransaction.sign([to]);

    const clearSignature = await solana.connection.sendRawTransaction(
      clearTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      },
    );

    // 等待确认
    await solana.connection.confirmTransaction({
      signature: clearSignature,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    });

    console.log(`clearSignature ${clearSignature}`);
  };

  beforeEach(async () => {
    try {
      await clearFromAndToAccount();
    } catch (e) {
      console.log(e);
    }
  }, 10000 * 60);

  test(
    "from none sol to none ata account",
    { timeout: 1000 * 60 },
    async () => {
      // from 无 sol 对方账户无 ata
      await solana.sendToken({
        from: adminPayer,
        to: from.publicKey.toBase58(),
        amount: new Decimal(0.2 * 10 ** 6).toString(),
        tokenAddress: usdc,
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      expect(
        (await getUsdcBalance(from.publicKey.toBase58())).toString() ===
          new Decimal(0.2 * 10 ** 6).toString(),
      ).toBe(true);

      const transaction = await solana.sendToken({
        from,
        to: to.publicKey.toBase58(),
        amount: new Decimal(0.1 * 10 ** 6).toString(),
        tokenAddress: usdc,
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const [fromBalance, toBalance] = await Promise.all([
        getUsdcBalance(from.publicKey.toBase58()),
        getUsdcBalance(to.publicKey.toBase58()),
      ]);
      expect(
        new Decimal(fromBalance.toString()).lt(new Decimal(0.1 * 10 ** 6)),
      ).toBe(true);
      expect(
        new Decimal(toBalance.toString()).eq(new Decimal(0.1 * 10 ** 6)),
      ).toBe(true);
      console.log(transaction);
      console.log(
        `from: ${from.publicKey.toBase58()} ${fromBalance.toString()} to: ${to.publicKey.toBase58()} ${toBalance.toString()}  `,
      );
      await clearFromAndToAccount();
    },
  );
  test("from none sol to ata account", { timeout: 1000 * 60 }, async () => {
    await solana.sendToken({
      from: adminPayer,
      to: from.publicKey.toBase58(),
      amount: new Decimal(0.1 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    await solana.sendToken({
      from: adminPayer,
      to: to.publicKey.toBase58(),
      amount: new Decimal(0.1 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    expect(
      (await getUsdcBalance(from.publicKey.toBase58())).toString() ===
        new Decimal(0.1 * 10 ** 6).toString(),
    ).toBe(true);
    expect(
      (await getUsdcBalance(to.publicKey.toBase58())).toString() ===
        new Decimal(0.1 * 10 ** 6).toString(),
    ).toBe(true);

    const transaction = await solana.sendToken({
      from,
      to: to.publicKey.toBase58(),
      amount: new Decimal(0.05 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const [fromBalance, toBalance] = await Promise.all([
      getUsdcBalance(from.publicKey.toBase58()),
      getUsdcBalance(to.publicKey.toBase58()),
    ]);

    console.log(transaction);
    console.log(
      `from: ${from.publicKey.toBase58()} ${fromBalance.toString()} to: ${to.publicKey.toBase58()} ${toBalance.toString()}  `,
    );
    expect(new Decimal(fromBalance.toString()).lt(0.05)).toBe(true);
    expect(
      new Decimal(toBalance.toString()).eq(new Decimal(0.15 * 10 ** 6)),
    ).toBe(true);
    await clearFromAndToAccount();
  });
  test("from sol to none ata account", { timeout: 1000 * 60 }, async () => {
    await solana.sendToken({
      from: adminPayer,
      to: from.publicKey.toBase58(),
      amount: new Decimal(0.1 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    await solana.sendSol({
      from: adminPayer,
      to: from.publicKey.toBase58(),
      amount: new Decimal(0.005 * 10 ** 9).toString(),
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));

    expect(
      (await getUsdcBalance(from.publicKey.toBase58())).toString() ===
        new Decimal(0.1 * 10 ** 6).toString(),
    ).toBe(true);

    const transaction = await solana.sendToken({
      from,
      to: to.publicKey.toBase58(),
      amount: new Decimal(0.1 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    console.log(transaction);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const [fromBalance, toBalance, fromSolBalance] = await Promise.all([
      getUsdcBalance(from.publicKey.toBase58()),
      getUsdcBalance(to.publicKey.toBase58()),
      solana.getSolBalance(from.publicKey.toBase58()),
    ]);
    console.log(
      `from: ${from.publicKey.toBase58()} ${fromBalance.toString()} to: ${to.publicKey.toBase58()} ${toBalance.toString()}  `,
    );
    expect(new Decimal(fromBalance.toString()).eq(new Decimal(0))).toBe(true);
    expect(
      new Decimal(toBalance.toString()).eq(new Decimal(0.1 * 10 ** 6)),
    ).toBe(true);
    expect(
      new Decimal(fromSolBalance).div(new Decimal(10 ** 9)).lt(0.005),
    ).toBe(true);

    await clearFromAndToAccount();
  });
  test("from sol to   ata account", { timeout: 1000 * 60 }, async () => {
    // await solana.sendToken({
    //   from: adminPayer,
    //   to: from.publicKey.toBase58(),
    //   amount: new Decimal(0.1 * 10 ** 6).toString(),
    //   tokenAddress: usdc,
    // });
    // await solana.sendToken({
    //   from: adminPayer,
    //   to: from.publicKey.toBase58(),
    //   amount: new Decimal(0.1 * 10 ** 6).toString(),
    //   tokenAddress: usdc,
    // });
    // await solana.sendSol({
    //   from: adminPayer,
    //   to: from.publicKey.toBase58(),
    //   amount: new Decimal(0.005 * 10 ** 9).toString(),
    // });
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    // expect(
    //   (await getUsdcBalance(from.publicKey.toBase58())).toString() ===
    //     new Decimal(0.1 * 10 ** 6).toString()
    // ).toBe(true);
    // expect(
    //   (await getUsdcBalance(to.publicKey.toBase58())).toString() ===
    //     new Decimal(0.1 * 10 ** 6).toString()
    // ).toBe(true);

    const transaction = await solana.sendToken({
      from,
      to: to.publicKey.toBase58(),
      amount: new Decimal(0.1 * 10 ** 6).toString(),
      tokenAddress: usdc,
    });
    console.log(transaction);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const [fromBalance, toBalance, fromSolBalance] = await Promise.all([
      getUsdcBalance(from.publicKey.toBase58()),
      getUsdcBalance(to.publicKey.toBase58()),
      solana.getSolBalance(from.publicKey.toBase58()),
    ]);
    console.log(
      `from: ${from.publicKey.toBase58()} ${fromBalance.toString()} to: ${to.publicKey.toBase58()} ${toBalance.toString()}  `,
    );
    expect(new Decimal(fromBalance.toString()).eq(new Decimal(0))).toBe(true);
    expect(
      new Decimal(toBalance.toString()).eq(new Decimal(0.2 * 10 ** 6)),
    ).toBe(true);
    expect(
      new Decimal(fromSolBalance).div(new Decimal(10 ** 9)).lt(0.005),
    ).toBe(true);

    await clearFromAndToAccount();
  });
});

test("send token fee", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const from = Keypair.fromSecretKey(
    new Uint8Array(
      bs58.decode(
        "3QSfqyPWzBNhH5RXw6yG9dHw37MGWyPmAjpTB3G3zPPey2zx4wyNpsTuArGqt6cTm4rirYJtPVnEZoXomwU6PBLJ",
      ),
    ),
  );

  const to = "2HuojpCGomMmbfuRmbo99ruVz5mHzoUMmWzmDWMgxVPx";
  const latestBlockhash = await solana.connection.getLatestBlockhash();

  // const fee = await solana.sendTokenFee({
  //   from: from,
  //   to,
  //   amount: new Decimal(1000000).toString(),
  //   tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  //   blockhash: latestBlockhash.blockhash,
  // });

  // const createATAInstruction = solana.buildCreateATAInstruction({
  //   address: to,
  //   tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  //   feePayer: from.publicKey,
  // });

  const computeUnitTransactionInstructionForSimulate =
    solana.buildComputeUnitTransactionInstruction({
      computeUnitPrice: 2_500_000,
      unitsConsumed: 100000,
    });

  const instruction = solana.buildTokenTransferTransactionInstruction({
    from: from.publicKey.toBase58(),
    to,
    amount: new Decimal(1).toString(),
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    feePayer: from.publicKey,
  });

  const finalVersionedTransaction = solana.buildTransaction({
    instructions: [
      ...computeUnitTransactionInstructionForSimulate,
      ...instruction,
    ],
    addressLookupTableAddresses: [],
    blockhash: latestBlockhash.blockhash,
    feePayer: from,
  });

  const data = finalVersionedTransaction.serialize();

  console.log(Buffer.from(data).toString("hex"));

  const simulate = await solana.connection.simulateTransaction(
    finalVersionedTransaction,
  );

  console.log(simulate);
  console.log(JSON.stringify(simulate));
});

test("get transaction detail", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const transaction = await solana.getTransactionListByAddress(
    "5QhfrY2hQABXnDXzBsQmafduwn7dKFJdPG8amuanLApn",
    { limit: 5 },
  );
  console.log(transaction);
});

test("get balance change", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });
  const transactionDetail = await solana.getTransactionDetail(
    "DwkrZsk3YYdXsgQEYD1TqWA12nHG9J4KV6AfaWEa442yjMn9B3D9hyjtTtHFL4mktpLKeYmNNQihHWwPBK5qJ5z",
  );
  expect(transactionDetail).not.toBeNull();

  const balanceChange = solana.getBalanceChange(
    "FncizudA94jN5VgFru9rB1YaeTiqstdJyUn7JZUhVmzH",
    transactionDetail!,
  );
  console.log(balanceChange);
});

test("get token info", async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const tokenInfo = await solana.getTokenInfo(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  );

  console.log(tokenInfo);
});

test("list spl token", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
    heliusApiKey: testConfig.HELIUS_API_KEY,
  });

  const tokenList = await solana.getAddressTokenList(
    "2uw1ohVsF2BZukDip76iyAeKSE1rtwB1PPTuRssBWtbe",
  );

  const tokenInfoList = await Promise.all(
    tokenList.map(async (token) => {
      const tokenBalance = await solana.getTokenAccountBalance(token);
      const tokenInfo = await solana.getTokenInfo(tokenBalance.mint.toBase58());

      return {
        ...tokenInfo,
        balance: tokenBalance.amount,
      };
    }),
  );
});

test.only("test send tx", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
   
  });

  const instruction = await solana.buildCreateMintTransactionInstruction({
    from: new PublicKey(userAddress),
    name,
    symbol,
    decimals,
  });

  const latestBlockhash = await solana.connection.getLatestBlockhash();

  const tx = solana.buildTransaction({
    instructions: [...instruction],
    addressLookupTableAddresses: [],
    blockhash: latestBlockhash.blockhash,
    feePayer: new PublicKey(userAddress),
  });

  

  const transaction = VersionedTransaction.deserialize(
    Buffer.from(hex, "hex"),
  );

  console.log(transaction);
 
  const signature = await solana.connection.sendRawTransaction(
    transaction.serialize(),
    {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    },
  );

  console.log(signature);
});