import { Redis } from "@upstash/redis";
import { z } from "zod";
import { config } from "../../config";
export const walletSchema = z.object({
  address: z.string(),
  network: z.enum(["svm", "evm", "tron"]),
  chainId: z.coerce.string(),
});

export class UpstashRedisStorage {
  private redis: Redis;
  constructor(options: { url: string; token: string }) {
    this.redis = new Redis({
      url: options.url,
      token: options.token,
    });
  }

  async setToken(uuid: string, jwt: string) {
    await this.redis.set(`${uuid}:token`, jwt, { ex: 60 * 60 });
  }

  async getToken(uuid: string) {
    return await this.redis.get<string>(`${uuid}:token`);
  }

  async setCurrentWallet(uuid: string, data: z.infer<typeof walletSchema>) {
    await this.redis.set(`${uuid}:wallet`, data);
  }

  async getCurrentWallet(uuid: string) {
    return await this.redis.get<z.infer<typeof walletSchema>>(`${uuid}:wallet`);
  }

  async setActiveConn(topic: string) {
    await this.redis.set(`${topic}:active`, new Date().getTime());
  }

  async getActiveConn(topic: string) {
    const time = await this.redis.get<number>(`${topic}:active`);
    return time ? new Date().getTime() - time < 1000 * 40 : false;
  }
  async setTopicIp(topic: string, ip: string) {
    const existIp = await this.redis.get<string>(`${topic}:ip`)
    if (!existIp) {
      await this.redis.set(`${topic}:ip`, ip)
    }
  }

  async getTopicIp(topic: string) {
    return await this.redis.get<string>(`${topic}:ip`)
  }
}

export const redisStorage = new UpstashRedisStorage({
  url: config.redisUrl,
  token: config.redisToken,
});
