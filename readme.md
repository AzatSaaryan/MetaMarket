# 🖼️ NFT Marketplace Backend

This is the backend for an NFT marketplace project.  
It allows users to upload images, automatically generate and store NFT metadata on IPFS, mint NFTs on the blockchain (Sepolia testnet), and interact with their tokens.

---

## 🚀 Tech Stack

- **Node.js + Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **Solidity (ERC-721)** via Hardhat
- **IPFS (nft.storage)**
- **ethers.js** for smart contract interaction
- **Zod** for request validation
- **JWT (access + refresh tokens)** for authentication
- **Multer** for file uploads

---

## 📁 Project Structure

```
/src
/controllers # API logic
/services # Business logic
/repositories # DB interaction
/middlewares # Authentication, file uploads, etc.
/routes # Express route definitions
/utils # Helpers, error classes, etc.
/contracts # Solidity smart contracts (ERC-721)
/types # Custom TypeScript definitions
```

---

## ⚙️ Features

### ✅ NFT Creation Flow

1. **Upload an image** via API
2. **Generate metadata** and store it on IPFS
3. **Mint NFT** on Sepolia blockchain using a deployed ERC-721 smart contract
4. **Save all data** to MongoDB, including token ID and IPFS links

### 🔒 Authentication

- Wallet-based (address via cookie)
- JWT (access and refresh token)
- Middleware to protect routes

### 📦 IPFS Integration

- Uses `nft.storage` to upload both images and metadata
- Returns `ipfs://` URL + public gateway link

### 🧠 Smart Contract

- Simple ERC-721 contract with `mintNFT(address to, string tokenURI)` method
- Deployed to Sepolia testnet
- Interacted with via `ethers.js`

---

## 🧪 API Endpoints (examples)

| Method | Route         | Description             |
| ------ | ------------- | ----------------------- |
| POST   | `/auth/login` | Wallet-based login      |
| POST   | `/nft/create` | Upload image + mint NFT |
| GET    | `/nft/:id`    | Get NFT by ID           |
| PATCH  | `/nft/:id`    | Update NFT price        |
| GET    | `/nfts`       | List NFTs               |

---

## 📄 Environment Variables

Create a `.env` file:

```env
MONGO_URI=<your MongoDB connection string>
ACCESS_TOKEN_SECRET=<JWT secret>
REFRESH_TOKEN_SECRET=<JWT refresh secret>
PRIVATE_KEY=<your Sepolia wallet private key>
CONTRACT_ADDRESS=<deployed ERC-721 contract address>
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
```

---

## Contracts (Solidity)

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    function mintNFT(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 newId = _tokenIdCounter;
        _mint(to, newId);
        _setTokenURI(newId, tokenURI);
        return newId;
    }
}
```

---

## 🛡 Future Improvements

NFT transfer / marketplace logic

On-chain royalties

Frontend integration (React)

IPFS pinning service migration (nft.storage uploads are deprecated)

## 🧑‍💻 Author

Built with ❤️ by Azat Saaryan
