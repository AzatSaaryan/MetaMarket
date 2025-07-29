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
import MetaToken from "../artifacts/contracts/MetaToken.sol/MetaToken.json";

const RPC_URL = process.env.ALCHEMY_NETWORK_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

class NFTService {
  async uploadImage(file: Express.Multer.File): Promise<IPFSUploadResponse> {
    if (!file) {
      throw new Error("Image file is required");
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        "Invalid image file type. Only JPEG, PNG, and GIF are allowed."
      );
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit.");
    }

    try {
      const { ipfsUrl, gatewayUrl } = await uploadImageToIPFS(file);
      if (!ipfsUrl || !gatewayUrl) {
        throw new Error("Failed to upload image to IPFS");
      }
      return { ipfsUrl, gatewayUrl };
    } catch (error) {
      console.error("Failed to upload image to IPFS:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        fileName: file.originalname,
      });
      throw new Error(
        `Failed to upload image to IPFS: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async uploadMetadata(
    metadata: NFTMetadata
  ): Promise<NFTMetadataUploadResponse> {
    if (!metadata) {
      throw new Error("Metadata is required");
    }
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
    if (!nftData) {
      throw new Error("NFT creation data is required");
    }
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
      ) {
        throw new Error("All fields are required to create an NFT");
      }
      const existingNFT = await nftRepository.findByImageAndMetadataHash(
        metadataUrl,
        imageUrl
      );
      if (existingNFT) {
        throw new Error("NFT already exists");
      }
      const nft = await nftRepository.createNFT(nftData);
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
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MetaToken.abi,
      wallet
    );

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
