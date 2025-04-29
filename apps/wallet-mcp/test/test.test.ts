// import { decodeJwt } from "jose";
// import { getTrpcClient } from "../src/lib";
// import { test, expect } from "vitest";

// // test("test", async () => {
// //   let uuid: string | null = null;

// //   const token =
// //     "eyJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiNDRjNzJlMDMtNDNhMC00MTY1LTllNWItYzk3ZTU5ZGI2ZWZkIiwiZXhwIjoxNzQ0OTcyOTIwfQ.WQnqspdOzS7vvTD-MHCQ0zixy14-VQMPwm5uqrZDEZQ";
// //   if (!token) {
// //     throw new Error("token is null");
// //   }
// //   const payload = await decodeJwt(token);
// //   console.log(payload);
// //   if (payload?.exp && payload.exp < Date.now() / 1000) {
// //     throw new Error("token expired");
// //   }
// //   if (!payload?.uuid) {
// //     throw new Error("uuid is null");
// //   }
// //   uuid = payload?.uuid as string;
// //   console.log(new Date(payload.exp * 1000));
// // });

// import open from "open";
// import { config } from "@tokenpocket/trpc/src/config";

// test.only("test", async () => {

//   process.on("exit", () => {
//     console.log("exit");
//   });

//   console.log(process);
// });
