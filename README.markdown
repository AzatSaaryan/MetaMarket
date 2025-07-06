# NFT Marketplace Backend

This is a backend for an NFT marketplace built with TypeScript, Express, Mongoose, Zod, and NFT.Storage. It allows users to upload images and metadata to IPFS, mint NFTs on the Ethereum Sepolia testnet, and store NFT data in MongoDB. The project includes validation for Ethereum addresses and IPFS URLs, ensuring robust data handling.

## Features

- **Image and Metadata Upload**: Upload NFT images and metadata to IPFS using NFT.Storage.
- **Data Validation**: Validate input data (e.g., NFT metadata, Ethereum addresses) using Zod.
- **MongoDB Integration**: Store NFT data (e.g., `token_id`, `ownerAddress`, `metadataUrl`) in MongoDB.
- **Sepolia Testnet**: Mint NFTs on the Ethereum Sepolia testnet via a smart contract.
- **Type-Safe**: Fully typed with TypeScript for better developer experience and safety.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod for schema validation
- **IPFS**: NFT.Storage for decentralized storage
- **Blockchain**: Ethereum Sepolia testnet (via Ethers.js)
- **File Upload**: Multer for handling image uploads
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- NFT.Storage API key (get from [nft.storage](https://nft.storage))
- Ethereum Sepolia testnet provider (e.g., Alchemy or Infura)
- Sepolia testnet wallet with test ETH (for minting)
- Optional: Pinata API key for faster IPFS gateway (recommended)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/nft-marketplace-backend.git
   cd nft-marketplace-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/nft-marketplace
   NFT_STORAGE_API_KEY=your_nft_storage_api_key
   ETHEREUM_PROVIDER_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
   WALLET_PRIVATE_KEY=your_wallet_private_key
   CONTRACT_ADDRESS=your_smart_contract_address
   ```

4. **Compile TypeScript**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## Project Structure

```plaintext
├── src/
│   ├── models/
│   │   └── nft.ts              # Mongoose schema for NFT
│   ├── schemas/
│   │   └── nft.ts              # Zod schemas for input and metadata validation
│   ├── routes/
│   │   └── nft.ts              # Express routes for NFT operations
│   ├── ipfs.ts                 # Functions for uploading to IPFS
│   ├── index.ts                # Entry point for the Express server
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### API Endpoints

#### Create an NFT
- **Endpoint**: `POST /create-nft`
- **Description**: Uploads an image and metadata to IPFS, validates data, and saves the NFT to MongoDB.
- **Request**:
  - Form-data:
    - `image`: Image file (PNG, JPEG, or GIF)
    - `name`: NFT name (string)
    - `description`: NFT description (string)
    - `creatorAddress`: Creator's Ethereum address (string)
    - `price`: NFT price in ETH (number)
    - `token_id`: Token ID (number)
    - `contractAddress`: Smart contract address (string, optional)
    - `ownerAddress`: Owner's Ethereum address (string, optional)
    - `attributes`: JSON string of attributes (optional, e.g., `[{"trait_type": "Color", "value": "Blue"}]`)
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/create-nft \
    -F "image=@/path/to/image.png" \
    -F "name=My NFT" \
    -F "description=Cool NFT" \
    -F "creatorAddress=0x1234567890abcdef1234567890abcdef12345678" \
    -F "price=0.5" \
    -F "token_id=1" \
    -F "attributes=[{\"trait_type\": \"Color\", \"value\": \"Blue\"}]"
  ```
- **Response**:
  ```json
  {
    "success": true,
    "nft": {
      "token_id": 1,
      "name": "My NFT",
      "description": "Cool NFT",
      "imageUrl": "ipfs://Qm...",
      "imageGatewayUrl": "https://ipfs.io/ipfs/Qm...",
      "metadataUrl": "ipfs://Qm...",
      "metadataGatewayUrl": "https://ipfs.io/ipfs/Qm...",
      "creatorAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "ownerAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "price": 0.5
    }
  }
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

## Future Improvements

- Add support for other blockchains (e.g., Polygon).
- Implement event listeners for `Transfer` events to update `ownerAddress` in MongoDB.
- Optimize gas costs for minting using layer-2 solutions.
- Add authentication for secure NFT creation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License