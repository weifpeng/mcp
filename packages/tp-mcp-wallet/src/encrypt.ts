// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { webcrypto } from "crypto";

let cryptoAPI: typeof webcrypto;

if (typeof globalThis.crypto !== "undefined") {
  cryptoAPI = globalThis.crypto as typeof webcrypto;
} else {
  cryptoAPI = webcrypto;
}

/**
 * 使用AES-256-GCM加密数据
 * @param data 要加密的数据
 * @param key 密钥 (32字节/256位)
 * @param encoding 输入数据的编码格式
 * @returns 加密结果 (十六进制字符串，IV作为前缀)
 */
export async function encrypt(
  data: string,
  key: string | Buffer,
  encoding: BufferEncoding = "utf8",
): Promise<string> {
  // 转换密钥为 ArrayBuffer
  const keyBuffer =
    typeof key === "string"
      ? hexToArrayBuffer(key)
      : bufferToArrayBuffer(key as Buffer);

  // 生成随机 IV (12字节是GCM的推荐长度)
  const iv = cryptoAPI.getRandomValues(new Uint8Array(12));
  // 导入密钥
  const cryptoKey = await cryptoAPI.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  // 转换数据为 ArrayBuffer
  const dataBuffer = new TextEncoder().encode(data);

  // 加密数据
  const encryptedBuffer = await cryptoAPI.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataBuffer,
  );

  // 将 IV + 加密数据合并为一个字符串
  const ivHex = arrayBufferToHex(iv.buffer);
  const encryptedHex = arrayBufferToHex(encryptedBuffer);

  return ivHex + encryptedHex;
}

/**
 * 解密AES-256-GCM加密的数据
 * @param encryptedString 加密的数据 (十六进制字符串，IV作为前缀)
 * @param key 密钥 (32字节/256位)
 * @param outputEncoding 输出数据的编码格式
 * @returns 解密后的数据
 */
export async function decrypt(
  encryptedString: string,
  key: string | Buffer,
  outputEncoding: BufferEncoding = "utf8",
): Promise<string> {
  // 从字符串中提取 IV 和加密数据
  // IV 是 12 字节，十六进制表示为 24 个字符
  const ivHex = encryptedString.substring(0, 24);
  const encryptedHex = encryptedString.substring(24);

  // 转换密钥为 ArrayBuffer
  const keyBuffer =
    typeof key === "string"
      ? hexToArrayBuffer(key)
      : bufferToArrayBuffer(key as Buffer);

  // 导入密钥
  const cryptoKey = await cryptoAPI.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  // 转换 IV 和加密数据为 ArrayBuffer
  const ivBuffer = hexToArrayBuffer(ivHex);
  const encryptedBuffer = hexToArrayBuffer(encryptedHex);

  // 解密数据
  const decryptedBuffer = await cryptoAPI.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    cryptoKey,
    encryptedBuffer,
  );

  // 转换结果为字符串
  return new TextDecoder(outputEncoding).decode(decryptedBuffer);
}

/**
 * 生成随机密钥
 * @returns 随机生成的密钥 (十六进制编码)
 */
export function generateKey(): string {
  // 生成随机 256 位密钥
  const key = cryptoAPI.getRandomValues(new Uint8Array(32));

  // 转换为十六进制编码
  return arrayBufferToHex(key.buffer);
}

// 工具方法
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  // 转换 Node.js Buffer 为 ArrayBuffer
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export const hashSHA256 = async (input: string) => {
  const encoder = new TextEncoder();

  const data = encoder.encode(input);
  const hashBuffer = await cryptoAPI.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
