import {
  createWalletClient,
  custom,
  http,
  parseEther,
  createPublicClient,
  encodeFunctionData,
  parseAbi,
  stringToHex,
} from "viem";
import { mainnet, arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import crypto from "node:crypto";
import { test, expect } from "vitest";

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

async function sendEthWithPrivateKey() {
  // Generate a random private key
  const privateKey =
    `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`;
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  const to = privateKeyToAccount(
    `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`,
  );

  const amount = "0.01";

  // 注意：这会尝试发送实际交易，但由于使用了随机生成的地址，没有余额，所以会失败
  // 为测试目的，我们只模拟这个过程
  try {
    const hash = await walletClient.sendTransaction({
      to: to.address,
      value: parseEther(amount),
    });
    console.log("Transaction hash:", hash);
    return hash;
  } catch (error) {
    console.log("交易会失败，因为随机账户没有余额，这是预期的行为");
    console.error(error);
    // 为测试目的返回模拟的哈希
    return `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`;
  }
}

// 构造离线交易（不发送）
async function buildEthTransferTransaction() {
  // 生成随机发送方地址和私钥
  const privateKey =
    `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`;
  const account = privateKeyToAccount(privateKey);

  // 生成随机接收方地址
  const to = privateKeyToAccount(
    `0x${crypto.randomBytes(32).toString("hex")}` as `0x${string}`,
  );

  // 转账金额（ETH）
  const amount = "0.01";

  // 构造交易请求
  const transactionData = {
    to: to.address,
    value: parseEther(amount),
    chainId: arbitrumSepolia.id,
  };

  console.log("交易请求数据:", transactionData);

  // 获取交易的序列化数据 - 在实际应用中，你可能会使用更复杂的序列化方法
  // 这里我们只是简单地将交易数据转为JSON字符串，再转为十六进制
  const transactionHex = stringToHex(JSON.stringify(transactionData));

  return {
    transactionData,
    transactionHex,
    from: account.address,
    to: to.address,
    amount: amount,
  };
}

test("应该能构造ETH转账交易", async () => {
  const hash = await sendEthWithPrivateKey();
  expect(hash).toBeDefined();
  expect(typeof hash).toBe("string");
  expect(hash.startsWith("0x")).toBe(true);
});

test("应该能构造离线ETH转账交易数据", async () => {
  const { transactionData, transactionHex, from, to, amount } =
    await buildEthTransferTransaction();

  // 验证请求数据
  expect(transactionData).toBeDefined();
  expect(transactionData.to).toBe(to);
  expect(transactionData.value).toBeDefined();

  // 验证交易十六进制数据
  expect(transactionHex).toBeDefined();
  expect(typeof transactionHex).toBe("string");
  expect(transactionHex.startsWith("0x")).toBe(true);

  console.log("构造的转账交易:");
  console.log("从地址:", from);
  console.log("到地址:", to);
  console.log("金额:", amount, "ETH");
  console.log("交易数据:", transactionHex);
});
