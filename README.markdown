# NFT Marketplace — Backend

A TypeScript-based backend for a decentralized NFT marketplace. It supports minting NFTs with metadata, storing data on IPFS, validating inputs, and managing users and sessions. Built with Express, MongoDB, Redis, and Pinata, this backend is ready for integration with Ethereum testnets (e.g., Sepolia).

## Features

- **Image and Metadata Upload**: Upload NFT images and metadata to IPFS using Pinata.
- **Data Validation**: Validate input data (e.g., NFT metadata, Ethereum addresses) using Zod.
- **MongoDB Integration**: Store NFT data (e.g., `token_id`, `ownerAddress`, `metadataUrl`) in MongoDB.
- **Sepolia Testnet**: Mint NFTs on the Ethereum Sepolia testnet via a smart contract.
- **Type-Safe**: Fully typed with TypeScript for better developer experience and safety.
- **Authentication**: Token-based authentication with refresh token support (stored in Redis)

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose, Redis
- **Validation**: Zod for schema validation
- **IPFS**: NFT.Storage for decentralized storage
- **Blockchain**: Ethereum Sepolia testnet (via Ethers.js)
- **File Upload**: Multer for handling image uploads
- **Environment**: dotenv for configuration
  `

## Project Structure

```plaintext
├── src/
│   ├── auth/
│   │   └── authController.ts
│   │   └── authRepository.ts
│   │   └── auth.Router.ts
│   │   └── authService.ts
│   ├── db/
│   │   └── db.ts
│   │   └── redis-store.ts
│   ├── middlewares/
│   │   └── authMiddleware.ts
│   │   └── uploadImageMiddleware
│   ├── NFTs/
│   │   └── nftController.ts
│   │   └── nftModel.ts
│   │   └── nftRepository.ts
│   │   └── nftRouter.ts
│   │   └── nftService.ts
│   │   └── nftTypes.ts
│   ├── users/
│   │   └── userController.ts
│   │   └── userModel.ts
│   │   └── userRepository.ts
│   │   └── userRouter.ts
│   │   └── userService.ts
│   ├── utils/
│   │   └── authUtils.ts
│   │   └── nftStorageClient.ts
├── index.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Data Storage

- **IPFS**: Stores NFT metadata (e.g., `name`, `description`, `image`, `attributes`) and images using NFT.Storage. Metadata is immutable and referenced by `ipfs://<CID>` in the smart contract.
- **MongoDB**: Stores NFT data (`token_id`, `ownerAddress`, `contractAddress`, `metadataUrl`, `imageUrl`, etc.) for indexing and fast retrieval.
- **Blockchain**: `token_id`, `ownerAddress`, and `contractAddress` are managed by the ERC-721 smart contract on Sepolia. Metadata is linked via `tokenURI` (IPFS URL).

### Validation

- **Zod**: Validates input data and metadata:
  - Ensures `name` and `description` are non-empty strings with length limits.
  - Validates Ethereum addresses (`0x...`) and IPFS URLs (`ipfs://...`).
  - Checks `price` as a non-negative number.
  - Validates optional `attributes` as an array of `{ trait_type, value }`.

## Smart Contract

The project assumes an ERC-721 smart contract deployed on Sepolia. Example contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    uint256 private _tokenIds;
    constructor() ERC721("MyNFT", "MNFT") {}
    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
```

Deploy the contract using Hardhat or Remix, and update `CONTRACT_ADDRESS` in `.env`.

## Notes

- **IPFS Gateway**: The project uses `https://ipfs.io/ipfs/<CID>` as the default gateway. For better performance, consider using a Pinata Dedicated Gateway (`https://yourname.mypinata.cloud`).
- **Sepolia Testnet**: Ensure you have test ETH for gas fees. Use a faucet like [Alchemy Sepolia Faucet](https://sepoliafaucet.com).
- **MongoDB**: Configure `MONGODB_URI` for a local or cloud MongoDB instance.
- **Error Handling**: Zod provides detailed validation errors, and API responses include clear error messages.

## License

MIT License
