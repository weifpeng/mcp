import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenError,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createMint,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Finality,
  Keypair,
  PublicKey,
  SignaturesForAddressOptions,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { Serializer } from '@metaplex-foundation/umi/serializers';



import bs58 from "bs58";
import { Helius } from "helius-sdk";
export { isAddress } from "@solana/addresses";

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";

import {
  signerIdentity,
  Signer,
  createSignerFromKeypair,
  percentAmount,
  publicKey
} from "@metaplex-foundation/umi";

import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'


import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  TokenStandard,
  createAndMint,
  createV1,
  findMetadataPda,
  getCreateMetadataAccountV3InstructionDataSerializer,
  getCreateV1InstructionDataSerializer,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { z } from "zod";
import Decimal from "decimal.js";

import { type Instruction, createJupiterApiClient } from "@jup-ag/api";
import data from "./solana.tokenlist.json";

export const WARP_SOL_ADDRESS = "So11111111111111111111111111111111111111112";
const COMPUTE_UNIT_LIMIT_MARGIN = 1.05;
const OPEN_TOKEN_ACCOUNT_FEE = 0.002;
const TRANSFER_TOKEN_FEE_MIN_LIMIT = 0.002;
const COMPUTE_UNIT_PRICE = 2_000_000;

function deserializeInstruction(instruction: Instruction) {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programId),
    keys: instruction.accounts.map((key) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, "base64"),
  });
}
type VersionedTransactionResponse = NonNullable<
  Awaited<ReturnType<typeof SolanaSDK.prototype.getTransactionDetail>>
>;

export class SolanaSDK {
  connection: Connection;
  privateKey: string;
  jupiter = createJupiterApiClient();
  helius: Helius;

  constructor(params: {
    rpcUrl: string;
    privateKey: string;
    heliusApiKey: string;
  }) {
    this.connection = new Connection(params.rpcUrl, {
      commitment: "confirmed",
      disableRetryOnRateLimit: false,
    });
    this.privateKey = params.privateKey;
    this.helius = new Helius(params.heliusApiKey);
  }

  getKeypair(privateKey: string) {
    return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
  }

  getSystemFeePayer() {
    return Keypair.fromSecretKey(new Uint8Array(bs58.decode(this.privateKey)));
  }

  async generateKeypair() {
    const keypair = Keypair.generate();
    const secretKey = bs58.encode(keypair.secretKey);
    return {
      address: keypair.publicKey.toBase58(),
      secretKey,
    };
  }

  async getAddressLookupTableAccounts(
    addresses: string[]
  ): Promise<AddressLookupTableAccount[]> {
    const addressLookupTableAccountInfos =
      await this.connection.getMultipleAccountsInfo(
        addresses.map((address) => new PublicKey(address))
      );

    return addressLookupTableAccountInfos.reduce(
      (accounts, accountInfo, index) => {
        const addressLookupTableAddress = addresses[index];
        if (accountInfo && addressLookupTableAddress) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
          });
          accounts.push(addressLookupTableAccount);
        }

        return accounts;
      },
      new Array<AddressLookupTableAccount>()
    );
  }

  async estimateTransactionFee(param: {
    transaction: VersionedTransaction;
    priorityLevel?: "low" | "high" | "normal";
  }) {
    const { transaction, priorityLevel = "normal" } = param;

    const unitPriceConfig = {
      low: 1_000_000,
      normal: 2_000_000,
      high: 2_500_000,
    };

    const unitPrice = unitPriceConfig[priorityLevel];

    const [estimate, computeUnits] = await Promise.all([
      unitPrice,
      this.connection.simulateTransaction(param.transaction, {
        replaceRecentBlockhash: true,
        sigVerify: false,
      }),
    ]);

    const computeUnitPrice = estimate || 0;
    const unitsConsumed = computeUnits.value.unitsConsumed ?? null;

    if (computeUnits.value.err) {
      console.log(computeUnits.value.logs);
    }

    return {
      computeUnitPrice,
      unitsConsumed,
      error: computeUnits.value.err,
    };
  }

  async setBudgetInstruction(param: {
    instructions: TransactionInstruction[];
    addressLookupTableAddresses: AddressLookupTableAccount[];
    blockhash: string;
    feePayer: Keypair;
    priorityLevel?: "low" | "high" | "normal";
  }) {
    const {
      instructions,
      addressLookupTableAddresses,
      blockhash,
      feePayer,
      priorityLevel = "normal",
    } = param;

    const computeUnitTransactionInstructionForSimulate =
      this.buildComputeUnitTransactionInstruction({
        computeUnitPrice: 2_500_000,
        unitsConsumed: 1000000,
      });

    const simulateTransaction = this.buildTransaction({
      instructions: [
        ...computeUnitTransactionInstructionForSimulate,
        ...instructions,
      ],
      addressLookupTableAddresses,
      blockhash,
      feePayer,
    });

    const { computeUnitPrice, unitsConsumed, error } =
      await this.estimateTransactionFee({
        transaction: simulateTransaction,
        priorityLevel,
      });

    const actualComputeUnitTransactionInstruction =
      this.buildComputeUnitTransactionInstruction({
        computeUnitPrice,
        unitsConsumed,
      });

    return {
      instructions: [
        ...actualComputeUnitTransactionInstruction,
        ...instructions,
      ],
      computeUnitPrice,
      unitsConsumed,
      error,
    };
  }

  async isATAExist(param: { address: string; tokenAddress: string }) {
    const tokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.address)
    );
    return await getAccount(this.connection, tokenAccount).catch(() => false);
  }

  buildCloseTokenAccountInstruction(param: {
    account: PublicKey;
    tokenAddress: PublicKey;
    destination?: PublicKey;
  }) {
    const ataAccount = getAssociatedTokenAddressSync(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.account.toBase58())
    );
    return [
      createCloseAccountInstruction(
        ataAccount,
        param?.destination ? param.destination : param.account,
        param.account
      ),
    ];
  }

  buildNemoInstruction(param: { memo: string }) {
    return [
      new TransactionInstruction({
        keys: [],
        data: Buffer.from(param.memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      }),
    ];
  }

  buildCreateATAInstruction(param: {
    address: string;
    tokenAddress: string;
    feePayer: PublicKey;
  }) {
    const transactionInstructionList: TransactionInstruction[] = [];
    const tokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.address)
    );

    transactionInstructionList.push(
      createAssociatedTokenAccountInstruction(
        param.feePayer,
        tokenAccount,
        new PublicKey(param.address),
        new PublicKey(param.tokenAddress),
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    return transactionInstructionList;
  }

  buildSendSolTransactionInstruction(param: {
    from: Keypair;
    to: string;
    amount: string;
  }) {
    const transactionInstructionList: TransactionInstruction[] = [];
    transactionInstructionList.push(
      SystemProgram.transfer({
        fromPubkey: param.from.publicKey,
        toPubkey: new PublicKey(param.to),
        lamports: BigInt(new Decimal(param.amount).toString()),
      })
    );
    return transactionInstructionList;
  }

  async buildTokenSwapTransactionInstruction(param: {
    from: string;
    to: string;
    amount: string;
    inputMint: string;
    outputMint: string;
    swapMode?: "ExactIn" | "ExactOut";
    feePayer: PublicKey;
  }) {
    const toAta = getAssociatedTokenAddressSync(
      new PublicKey(param.outputMint),
      new PublicKey(param.to)
    );

    const quote = await this.jupiter.quoteGet({
      inputMint: param.inputMint,
      outputMint: param.outputMint,
      amount: Number(param.amount),
      swapMode: param.swapMode || "ExactIn",
      dexes: ["Raydium"],
      onlyDirectRoutes: true,
      slippageBps: 800,
    });

    const swapInstructionsResponse = await this.jupiter.swapInstructionsPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: param.from,
        destinationTokenAccount: toAta.toString(),
        useSharedAccounts: true,
        skipUserAccountsRpcCalls: true,
        computeUnitPriceMicroLamports: 2_500_000,
      },
    });

    const {
      // computeBudgetInstructions, // The necessary instructions to setup the compute budget.
      // setupInstructions, // Setup missing ATA for the users.
      swapInstruction, // The actual swap instruction.
      // cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
      addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
    } = swapInstructionsResponse;

    return {
      instructions: [
        deserializeInstruction(swapInstruction),
        // ...(cleanupInstruction
        //   ? [deserializeInstruction(cleanupInstruction)]
        //   : []),
      ],
      lookupTableAddresses: addressLookupTableAddresses,
    };
  }

  buildTokenTransferTransactionInstruction(param: {
    from: string;
    to: string;
    amount: string;
    tokenAddress: string;
    feePayer: PublicKey;
  }) {
    const transactionInstructionList: TransactionInstruction[] = [];
    const fromTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.from)
    );

    const toTokenAccount = getAssociatedTokenAddressSync(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.to)
    );


    transactionInstructionList.push(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        new PublicKey(param.from),
        BigInt(new Decimal(param.amount).toString())
      )
    );

    return transactionInstructionList;
  }

  buildComputeUnitTransactionInstruction(param: {
    computeUnitPrice: number;
    unitsConsumed: number | null;
  }) {
    const { computeUnitPrice, unitsConsumed } = param;

    const unitsConsumedInstructions = unitsConsumed
      ? [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: unitsConsumed * COMPUTE_UNIT_LIMIT_MARGIN,
        }),
      ]
      : [];
    const computeBudgetInstructions =
      computeUnitPrice > 0
        ? [
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: computeUnitPrice,
          }),
        ]
        : [];
    return [...unitsConsumedInstructions, ...computeBudgetInstructions];
  }

  buildTransaction(param: {
    instructions: TransactionInstruction[];
    addressLookupTableAddresses: AddressLookupTableAccount[];
    blockhash: string;
    feePayer: Keypair;
  }) {
    const transaction = new TransactionMessage({
      payerKey: param.feePayer.publicKey,
      recentBlockhash: param.blockhash,
      instructions: param.instructions,
    }).compileToV0Message(param.addressLookupTableAddresses);

    return new VersionedTransaction(transaction);
  }

  async buildSendTokenTransaction(param: {
    from: Keypair;
    to: string;
    amount: string;
    tokenAddress: string;
    blockhash: string;
    memo?: string;
    payAccountRentFee?: boolean;
  }) {
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY_NOT_SET");
    }
    const adminPayer = Keypair.fromSecretKey(
      new Uint8Array(bs58.decode(this.privateKey))
    );

    let needAdminPay = false;

    const computeUnitTransactionInstructions: TransactionInstruction[] = [];
    const createTokenAccountInstructions: TransactionInstruction[] = [];
    const simulateSwapTransactionInstructions: TransactionInstruction[] = [];
    const transferTransactionInstructions: TransactionInstruction[] = [];
    const unwrapSolInstructions: TransactionInstruction[] = [];
    const memoInstructions: TransactionInstruction[] = [];
    let finalVersionedTransaction: VersionedTransaction;

    const fromSolBalance = await this.getSolBalance(
      param.from.publicKey.toBase58()
    );

    const needSwapToPaySol = new Decimal(fromSolBalance)
      .div(10 ** 9)
      .lt(TRANSFER_TOKEN_FEE_MIN_LIMIT);

    if (needSwapToPaySol) {
      needAdminPay = true;
    }

    // createTokenAccountInstructions
    const isToTokenAccountExist = await this.isATAExist({
      address: param.to,
      tokenAddress: param.tokenAddress,
    });
    if (!isToTokenAccountExist) {
      if (param.payAccountRentFee) {
        needAdminPay = true;
      }
      createTokenAccountInstructions.push(
        ...this.buildCreateATAInstruction({
          address: param.to,
          tokenAddress: param.tokenAddress,
          feePayer:
            param.payAccountRentFee || needSwapToPaySol
              ? adminPayer.publicKey
              : param.from.publicKey,
        })
      );
    }

    //transferTransactionInstructions
    console.log(
      `form: ${param.from.publicKey.toBase58()}, to: ${param.to}, amount: ${param.amount}, tokenAddress: ${param.tokenAddress}, feePayer: ${needSwapToPaySol ? adminPayer.publicKey : param.from.publicKey}`
    );
    transferTransactionInstructions.push(
      ...this.buildTokenTransferTransactionInstruction({
        from: param.from.publicKey.toBase58(),
        to: param.to,
        amount: param.amount,
        tokenAddress: param.tokenAddress,
        feePayer: needSwapToPaySol
          ? adminPayer.publicKey
          : param.from.publicKey,
      })
    );

    //memoInstructions
    if (param.memo) {
      memoInstructions.push(...this.buildNemoInstruction({ memo: param.memo }));
    }

    let formSwapSolAmount = "0";
    let solFee = "0";

    if (needSwapToPaySol) {
      if (needSwapToPaySol) {
        const isFeePayerWsolTokenAccountExist = await this.isATAExist({
          address: adminPayer.publicKey.toBase58(),
          tokenAddress: WARP_SOL_ADDRESS,
        });
        if (!isFeePayerWsolTokenAccountExist) {
          createTokenAccountInstructions.push(
            ...this.buildCreateATAInstruction({
              address: adminPayer.publicKey.toBase58(),
              tokenAddress: WARP_SOL_ADDRESS,
              feePayer: adminPayer.publicKey,
            })
          );
        }
      }

      //unwrapSolInstructions
      unwrapSolInstructions.push(
        ...this.buildCloseTokenAccountInstruction({
          account: adminPayer.publicKey,
          tokenAddress: new PublicKey(WARP_SOL_ADDRESS),
        })
      );

      // simulateSwapTransactionInstructions
      const { instructions: swapTransaction, lookupTableAddresses } =
        await this.buildTokenSwapTransactionInstruction({
          from: param.from.publicKey.toBase58(),
          to: adminPayer.publicKey.toBase58(),
          amount: "200000",
          inputMint: param.tokenAddress,
          outputMint: WARP_SOL_ADDRESS,
          swapMode: "ExactOut",
          feePayer: adminPayer.publicKey,
        });
      simulateSwapTransactionInstructions.push(...swapTransaction);

      const computeUnitTransactionInstructionForSimulate =
        this.buildComputeUnitTransactionInstruction({
          computeUnitPrice: 2_500_000,
          unitsConsumed: 1000000,
        });

      const addressLookupTableAddresses =
        await this.getAddressLookupTableAccounts(lookupTableAddresses);

      const simulateTransaction = [
        ...computeUnitTransactionInstructionForSimulate,
        ...createTokenAccountInstructions,
        ...simulateSwapTransactionInstructions,
        ...transferTransactionInstructions,
        ...memoInstructions,
        ...unwrapSolInstructions,
      ];

      const { computeUnitPrice, unitsConsumed } =
        await this.estimateTransactionFee({
          transaction: this.buildTransaction({
            instructions: simulateTransaction,
            addressLookupTableAddresses,
            blockhash: param.blockhash,
            feePayer: adminPayer,
          }),
        });

      const finalFee = new Decimal(computeUnitPrice)
        .mul(unitsConsumed || 0)
        .div(10 ** 6)
        .toString();

      const payerSolAmount = new Decimal(finalFee)
        .mul(COMPUTE_UNIT_LIMIT_MARGIN)
        .add(
          param.payAccountRentFee || isToTokenAccountExist
            ? 0
            : new Decimal(OPEN_TOKEN_ACCOUNT_FEE).mul(10 ** 9).toString()
        )
        .ceil()
        .toString();

      console.log(
        `payerSolAmount: ${payerSolAmount}, computeUnitPrice: ${computeUnitPrice}, unitsConsumed: ${unitsConsumed}, finalFee: ${finalFee}`
      );
      formSwapSolAmount = payerSolAmount;

      computeUnitTransactionInstructions.push(
        ...this.buildComputeUnitTransactionInstruction({
          computeUnitPrice,
          unitsConsumed,
        })
      );

      const {
        instructions: finalSwapTransaction,
        lookupTableAddresses: finalLookupTableAddresses,
      } = await this.buildTokenSwapTransactionInstruction({
        from: param.from.publicKey.toBase58(),
        to: adminPayer.publicKey.toBase58(),
        amount: payerSolAmount,
        inputMint: param.tokenAddress,
        outputMint: WARP_SOL_ADDRESS,
        swapMode: "ExactOut",
        feePayer: adminPayer.publicKey,
      });

      const finalLookupTableAccounts = await this.getAddressLookupTableAccounts(
        finalLookupTableAddresses
      );

      const finalInstructions = [
        ...computeUnitTransactionInstructions,
        ...createTokenAccountInstructions,
        ...finalSwapTransaction,
        ...transferTransactionInstructions,
        ...memoInstructions,
        ...unwrapSolInstructions,
      ];

      finalVersionedTransaction = this.buildTransaction({
        instructions: finalInstructions,
        addressLookupTableAddresses: finalLookupTableAccounts,
        blockhash: param.blockhash,
        feePayer: adminPayer,
      });
    } else {
      const computeUnitTransactionInstructionForSimulate =
        this.buildComputeUnitTransactionInstruction({
          computeUnitPrice: 2_500_000,
          unitsConsumed: 100000,
        });

      const simulateTransaction = [
        ...computeUnitTransactionInstructionForSimulate,
        ...createTokenAccountInstructions,
        ...transferTransactionInstructions,
        ...memoInstructions,
      ];

      const { computeUnitPrice, unitsConsumed } =
        await this.estimateTransactionFee({
          transaction: this.buildTransaction({
            instructions: simulateTransaction,
            addressLookupTableAddresses: [],
            blockhash: param.blockhash,
            feePayer: param.from,
          }),
        });

      computeUnitTransactionInstructions.push(
        ...this.buildComputeUnitTransactionInstruction({
          computeUnitPrice,
          unitsConsumed,
        })
      );
      const finalFee = new Decimal(computeUnitPrice)
        .mul(unitsConsumed || 0)
        .div(10 ** 6)
        .toString();

      console.log(
        `payerSolAmount: ${finalFee}, computeUnitPrice: ${computeUnitPrice}, unitsConsumed: ${unitsConsumed}, finalFee: ${finalFee}`
      );

      solFee = finalFee;
      const finalInstructions = [
        ...computeUnitTransactionInstructions,
        ...createTokenAccountInstructions,
        ...transferTransactionInstructions,
        ...memoInstructions,
      ];

      finalVersionedTransaction = this.buildTransaction({
        instructions: finalInstructions,
        addressLookupTableAddresses: [],
        blockhash: param.blockhash,
        feePayer: param.from,
      });
    }

    finalVersionedTransaction.sign([param.from]);

    if (!needAdminPay) {
      return {
        resignedTransaction: finalVersionedTransaction,
        formSwapSolAmount,
        solFee,
      };
    }

    const rawTransaction = finalVersionedTransaction.serialize();
    const resignedTransaction =
      VersionedTransaction.deserialize(rawTransaction);
    resignedTransaction.sign([adminPayer]);

    return { resignedTransaction, formSwapSolAmount, solFee };
  }

  async sendTokenFee(param: {
    from: Keypair;
    to: string;
    amount: string;
    tokenAddress: string;
    memo?: string;
    payAccountRentFee?: boolean;
  }) {
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY_NOT_SET");
    }
    const latestBlockhash = await this.connection.getLatestBlockhash();

    const { formSwapSolAmount, solFee } = await this.buildSendTokenTransaction({
      ...param,
      blockhash: latestBlockhash.blockhash,
    });

    if (solFee !== "0") {
      return {
        symbol: "SOL",
        decimal: 9,
        amount: solFee,
      };
    }

    console.log({
      inputMint: param.tokenAddress,
      outputMint: WARP_SOL_ADDRESS,
      amount: Number(formSwapSolAmount),
      swapMode: "ExactOut",
    });

    const quote = await this.jupiter.quoteGet({
      inputMint: param.tokenAddress,
      outputMint: WARP_SOL_ADDRESS,
      amount: Number(formSwapSolAmount),
      swapMode: "ExactOut",
    });

    const tokenInfo = await this.getTokenInfo(param.tokenAddress);
    if (!tokenInfo) {
      throw new Error("TOKEN_INFO_NOT_FOUND");
    }
    return {
      symbol: tokenInfo.symbol,
      decimal: tokenInfo.decimals,
      amount: quote.inAmount,
    };
  }

  async sendToken(param: {
    from: Keypair;
    to: string;
    amount: string;
    tokenAddress: string;
    memo?: string;
    payAccountRentFee?: boolean;
  }) {
    try {

      if (!this.privateKey) {
        throw new Error("PRIVATE_KEY_NOT_SET");
      }

      const { from } = param;
      const latestBlockhash = await this.connection.getLatestBlockhash();



      const { resignedTransaction: transaction } =
        await this.buildSendTokenTransaction({
          ...param,
          blockhash: latestBlockhash.blockhash,
        });

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      // 等待确认
      await this.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return signature;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getTokenAccount(param: { tokenAddress: string; owner: string }) {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(param.tokenAddress),
        new PublicKey(param.owner)
      );

      const account = await getAccount(this.connection, tokenAccount);

      return account;
    } catch (e) {
      if (e instanceof TokenError && e.name === "TokenAccountNotFoundError") {
        return null;
      }
      throw e;
    }
  }

  async calcTransactionFee(param: {
    to: string;
    amount: string;
    tokenAddress: string;
  }) {
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY_NOT_SET");
    }

    const fromTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(param.tokenAddress),
      new PublicKey(param.to)
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        fromTokenAccount,
        new PublicKey(param.to),
        BigInt(new Decimal(param.amount).toString())
      )
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(param.to);

    const message = transaction.compileMessage();

    const fees = await this.connection.getFeeForMessage(message);
    console.log(`Estimated token transfer cost: ${fees.value} lamports`);
    return fees.value;
  }

  async calculateAccountRent() {
    // 获取当前的租金配置
    const rentConfig =
      await this.connection.getMinimumBalanceForRentExemption(165);
    return rentConfig;
  }

  async getTokenInfo(address: string) {
    try {
      // Check if token exists in the local token list before querying on-chain metadata
      const tokenInfo = (data as any)?.tokens?.find((d: any) => d.address === address);
      if (tokenInfo) {
        return {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          logoUri: tokenInfo.logoURI,
        };
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const mintPubkey = new PublicKey(address);
      const accountInfo = await getMint(this.connection, mintPubkey);

      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
          mintPubkey.toBuffer(),
        ],
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
      );

      const accountMeta = await this.connection.getAccountInfo(metadataAddress);


      if (!accountMeta?.data) {
        return null;
      }

      // Parse metadata manually since we don't have access to the serializer
      const data = accountMeta.data;

      // Skip the first byte which is the version
      let offset = 1;

      // Skip update authority (32 bytes)
      offset += 32;

      // Skip mint (32 bytes)
      offset += 32;

      // Read name length (4 bytes) and name
      const nameLength = data.readUInt32LE(offset);
      offset += 4;
      if (offset + nameLength > data.length) return null;
      const name = data.slice(offset, offset + nameLength).toString('utf8').replace(/\0/g, '');
      offset += nameLength;

      // Read symbol length (4 bytes) and symbol
      const symbolLength = data.readUInt32LE(offset);
      offset += 4;
      if (offset + symbolLength > data.length) return null;
      const symbol = data.slice(offset, offset + symbolLength).toString('utf8').replace(/\0/g, '');
      offset += symbolLength;

      // Read URI length (4 bytes) and URI
      const uriLength = data.readUInt32LE(offset);
      offset += 4;
      if (offset + uriLength > data.length) return null;
      const uri = data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '');

      let logoUri = "";
      try {
        const res = await fetch(uri, {
          redirect: 'follow'
        });
        const metadata = await res.json();
        logoUri = metadata?.image;
      } catch (e) {
        console.error(e);
      }


      return {
        name,
        symbol,
        decimals: accountInfo.decimals,
        logoUri,
      };
    } catch (error) {
      console.error("Error fetching token info:", error);
      return null;
    }
  }

  async calculateFeeByUsdc(param: {
    to: string;
    amount: string;
    tokenAddress: string;
  }) {
    let fee = 0;

    const tokenAccount = await this.getTokenAccount({
      tokenAddress: param.tokenAddress,
      owner: param.to,
    });

    if (!tokenAccount) {
      fee = await this.calculateAccountRent();
    }

    const transactionFee = await this.calcTransactionFee(param);
    if (!transactionFee) {
      throw new Error("TRANSACTION_FEE_NOT_FOUND");
    }

    const solPrice = await this.getSolPrice();

    return new Decimal(fee + transactionFee)
      .div(10 ** 9)
      .mul(solPrice)
      .toNumber();
  }

  async calculateFee(param: {
    to: string;
    amount: string;
    tokenAddress: string;
  }) {
    let fee = 0;

    const tokenAccount = await this.getTokenAccount({
      tokenAddress: param.tokenAddress,
      owner: param.to,
    });

    if (!tokenAccount) {
      fee = await this.calculateAccountRent();
    }

    const transactionFee = await this.calcTransactionFee(param);
    if (!transactionFee) {
      throw new Error("TRANSACTION_FEE_NOT_FOUND");
    }

    return new Decimal(fee + transactionFee).toString();
  }

  async getSolPrice() {
    const res = await fetch(
      "https://api-v3.raydium.io/mint/price?mints=So11111111111111111111111111111111111111112"
    );

    const data = await res.json();
    const schema = z.object({
      data: z.object({
        So11111111111111111111111111111111111111112: z
          .string()
          .transform((val) => new Decimal(val)),
      }),
    });

    const result = schema.parse(data);
    return result.data.So11111111111111111111111111111111111111112;
  }

  async getPriceByToken(address: string[]) {
    const res = await fetch(
      `https://api-v3.raydium.io/mint/price?mints=${address.join(",")}`
    );

    const data = await res.json();
    const result: Array<{ address: string; price: string }> = [];
    for (const item of address) {
      result.push({
        address: item,
        price: data.data[item] ? new Decimal(data.data[item]).toString() : "0",
      });
    }

    return result;
  }

  async getAddressTokenList(address: string) {
    const tokenLargestAccounts = await this.connection.getTokenAccountsByOwner(
      new PublicKey(address),
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );
    const result: Array<{ tokenAccountAddress: string }> = [];
    for (const item of tokenLargestAccounts.value) {
      result.push({
        tokenAccountAddress: item.pubkey.toBase58(),
      });
    }
    return result;
  }

  async getTokenAccountBalance(param: { tokenAccountAddress: string }) {
    const tokenAccount = await getAccount(
      this.connection,
      new PublicKey(param.tokenAccountAddress)
    );
    return tokenAccount;
  }

  async getSolBalance(address: string) {
    const balance = await this.connection.getBalance(new PublicKey(address));
    return balance;
  }

  async sendSol(param: { from: Keypair; to: string; amount: string }) {
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: param.from.publicKey,
        toPubkey: new PublicKey(param.to),
        lamports: BigInt(new Decimal(param.amount).toString()),
      })
    );

    return await sendAndConfirmTransaction(
      this.connection,
      transferTransaction,
      [param.from]
    );
  }

  async getTransactionListByAddress(
    address: string,
    options?: SignaturesForAddressOptions,
    commitment?: Finality
  ) {
    const transaction = await this.connection.getSignaturesForAddress(
      new PublicKey(address),
      options,
      commitment
    );
    return transaction;
  }

  async getTransactionDetail(signature: string) {
    const transaction = await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    return transaction;
  }

  getBalanceChange(address: string, detail: VersionedTransactionResponse) {
    const accountList = detail.transaction.message.staticAccountKeys.map(
      (item) => item.toBase58()
    );

    const accountIndex = accountList.findIndex((item) => item === address);

    const balanceChange = new Decimal(
      detail.meta?.postBalances?.[accountIndex] || 0
    )
      .sub(detail.meta?.preBalances?.[accountIndex] || 0)
      .toString();

    const tokenBalanceChangeList: Array<{ mint: string; amount: string }> = [];

    for (let i = 0; i < (detail.meta?.postTokenBalances?.length || 0); i++) {
      const postTokenBalance = detail.meta?.postTokenBalances?.[i];

      if (postTokenBalance?.owner !== address) {
        continue;
      }

      const mint = postTokenBalance?.mint;

      if (!mint) {
        console.error(
          `address: ${address} tx: ${detail.transaction.signatures[0]} mint not found`
        );
        continue;
      }

      const preTokenBalance = detail.meta?.preTokenBalances?.find(
        (item) => item.mint === mint && item.owner === address
      );

      if (!preTokenBalance) {
        console.error(
          `address: ${address} tx: ${detail.transaction.signatures[0]} preTokenBalance not found`
        );
        continue;
      }

      const tokenBalanceChange = new Decimal(
        postTokenBalance?.uiTokenAmount?.amount || 0
      )
        .sub(preTokenBalance?.uiTokenAmount?.amount || 0)
        .toString();

      tokenBalanceChangeList.push({
        mint: mint,
        amount: tokenBalanceChange.toString(),
      });
    }

    return {
      sol: balanceChange,
      spl: tokenBalanceChangeList,
      accountList: accountList,
    };
  }

  async createToken(param: {
    from: Keypair;
    name: string;
    imageUrl: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
  }) {
    // Create the mint
    const mint = await createMint(
      this.connection,
      param.from,
      param.from.publicKey,
      null,
      param.decimals
    );

    // Create associated token account for the mint owner
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      param.from,
      mint,
      param.from.publicKey
    );

    // Mint tokens to the owner's account
    await mintTo(
      this.connection,
      param.from,
      mint,
      tokenAccount.address,
      param.from.publicKey,
      BigInt(new Decimal(param.initialSupply).mul(10 ** param.decimals).toString()),
      []
    );

    // Create Umi instance
    const umi = createUmi(this.connection.rpcEndpoint)
      .use(mplTokenMetadata())
      .use(mplToolbox())
      .use(irysUploader());

    // Create signer from keypair
    const signer = createSignerFromKeypair(umi, {
      publicKey: publicKey(param.from.publicKey.toBase58()),
      secretKey: param.from.secretKey,
    });

    // Set the signer as the identity
    umi.use(signerIdentity(signer));

    const umiImageFile = await fetch(param.imageUrl).then(res => res.arrayBuffer())

    const imageUri = await umi.uploader.upload([{
      buffer: Buffer.from(umiImageFile),
      fileName: "image.png",
      displayName: "image.png",
      uniqueName: "image.png",
      contentType: "image/png",
      extension: "png",
      tags: [{
        name: "image",
        value: "image.png",
      }],
    }]).catch((err) => {
      throw new Error(err)
    })


    // Create metadata
    const metadata = {
      name: param.name,
      symbol: param.symbol,
      description: `Token created by ${param.from.publicKey.toBase58()}`,
      image: imageUri[0],
      attributes: [],
    };

    const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
      throw new Error(err)
    })


    // Create metadata URI (you might want to upload this to IPFS or similar)


    const metadataAccountAddress = await findMetadataPda(umi, {
      mint: publicKey(mint.toBase58()),
    });

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true)
      }, 20000)
    })

    // Create token metadata
    const builder = await createV1(umi, {
      mint: publicKey(mint.toBase58()),
      authority: signer,
      payer: signer,
      updateAuthority: signer,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0), // 0% royalty
      tokenStandard: TokenStandard.Fungible,
    });

    // Build and send transaction
    try {
      const { signature } = await builder.sendAndConfirm(umi);

      return {
        mint: mint.toBase58(),
        metadata: metadata,
        signature,
      };
    } catch (e) {
      throw e
    }

  }
}
