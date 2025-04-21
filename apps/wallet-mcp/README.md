# TokenPocket Wallet MCP

Connect your crypto wallet to AI Client.

## Overview

TokenPocket Wallet MCP is an npm package that provides a seamless integration between AI Clients and user's crypto wallets. This package allows AI Clients to interact with blockchain functionality through natural language processing.

## Features

- **Wallet Connection**: Easily connect to a user's wallet to retrieve their address
- **Transaction Signing**: Support for signing transactions and messages
- **Multi-chain Support**: Currently supports Ethereum and Solana networks

## Usage

### Installation

```bash
npm install wallet-mcp
# or
yarn add wallet-mcp
```

### Basic Examples

#### Connect Wallet

```javascript
import { connectWallet } from 'wallet-mcp';

const wallet = await connectWallet();
console.log("Connected wallet address:", wallet.address);
```

#### Sign Message

```javascript
import { signMessage } from 'wallet-mcp';

const result = await signMessage({
  message: "Hello, blockchain!",
  network: "ethereum", // or "solana"
  isHex: false,
  address: "0x..."
});
console.log("Signature:", result.signature);
```

#### Sign Transaction

```javascript
import { signTransaction } from 'wallet-mcp';

const result = await signTransaction({
  transactionHex: "0x...",
  network: "ethereum", // or "solana"
  address: "0x..."
});
console.log("Signed transaction:", result.signedTransaction);
```

## Architecture

Wallet MCP interacts with the TokenPocket MCP DApp to handle the secure connection to user wallets and transaction signing.

### Workflow

1. **Wallet Connection**: AI Client -> Wallet MCP -> DApp -> User Wallet
2. **Transaction Signing**: AI Client -> Wallet MCP -> DApp -> User Wallet -> Signed Transaction

## License

[MIT](LICENSE)
