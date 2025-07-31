import {
  uploadMetadataToIPFS,
  uploadImageToIPFS,
} from "../utils/nftStorageClient.js";
import { INFT } from "../NFTs/nftModel.js";
import nftRepository from "./nftRepository.js";
import {
  IPFSUploadResponse,
  NFTMetadataUploadResponse,
  NFTMetadata,
  NFTCreationData,
} from "./nftTypes";
import { ethers } from "ethers";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RPC_URL = process.env.ALCHEMY_NETWORK_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const abiPath = path.resolve(
  __dirname,
  "../../artifacts/contracts/MetaToken.sol/MetaToken.json"
);
const abi = JSON.parse(readFileSync(abiPath, "utf8")).abi;

class NFTService {
  async uploadImage(file: Express.Multer.File): Promise<IPFSUploadResponse> {
    const MAX_SIZE = 10 * 1024 * 1024;

    if (!file) throw new Error("Image file is required");

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedMimeTypes.includes(file.mimetype))
      throw new Error(
        "Invalid image file type. Only JPEG, PNG, and GIF are allowed."
      );

    if (file.size > MAX_SIZE) throw new Error("File size exceeds 10MB limit.");

    const { ipfsUrl, gatewayUrl } = await uploadImageToIPFS(file);
    if (!ipfsUrl || !gatewayUrl)
      throw new Error("Failed to upload image to IPFS");

    return { ipfsUrl, gatewayUrl };
  }

  async uploadMetadata(
    metadata: NFTMetadata
  ): Promise<NFTMetadataUploadResponse> {
    if (!metadata) throw new Error("Metadata is required");

    try {
      const { ipfsUrl, gatewayUrl } = await uploadMetadataToIPFS(metadata);
      if (!ipfsUrl || !gatewayUrl) {
        throw new Error("Failed to upload metadata to IPFS");
      }
      return { ipfsUrl, gatewayUrl };
    } catch (error) {
      console.error("Failed to upload metadata to IPFS:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        metadata: metadata.name,
      });
      throw new Error(
        `Failed to upload metadata to IPFS: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async createNFT(nftData: NFTCreationData): Promise<INFT> {
    if (!nftData) throw new Error("NFT creation data is required");

    try {
      const {
        token_id,
        contractAddress,
        metadataUrl,
        name,
        description,
        imageUrl,
        ownerAddress,
        creatorAddress,
        price,
      } = nftData;

      if (
        !metadataUrl ||
        !name ||
        !description ||
        !imageUrl ||
        !ownerAddress ||
        !creatorAddress ||
        price === undefined
      )
        throw new Error("All fields are required to create an NFT");

      const existingNFT = await nftRepository.findByImageAndMetadataHash(
        metadataUrl,
        imageUrl
      );
      if (existingNFT) throw new Error("NFT already exists");

      const { tokenId, txHash } = await this.mintOnChain(
        ownerAddress,
        metadataUrl.replace("ipfs://", "")
      );

      const nft = await nftRepository.createNFT({
        ...nftData,
        token_id: tokenId,
        contractAddress: CONTRACT_ADDRESS,
      });
      return nft;
    } catch (error) {
      console.error("Error creating NFT:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        nftData,
      });
      throw new Error(
        `Failed to create NFT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async mintOnChain(
    to: string,
    metadataCid: string
  ): Promise<{
    tokenId: string;
    txHash: string;
  }> {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    try {
      const tx = await contract.safeMint(to, metadataCid);
      const receipt = await tx.wait();

      const tokenIdEvent = receipt.logs?.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );

      const tokenId = tokenIdEvent
        ? BigInt(tokenIdEvent.topics[3]).toString()
        : "unknown";

      return {
        tokenId,
        txHash: tx.hash,
      };
    } catch (error) {
      console.error("Minting on-chain failed:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        to,
        metadataCid,
      });
      throw new Error(
        `Minting on-chain failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

const nftService = new NFTService();
export default nftService;
