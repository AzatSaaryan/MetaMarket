import NFT, { INFT } from "./nftModel.js";

interface NFTCreationData {
  token_id?: string;
  contractAddress?: string;
  metadataUrl: string;
  name: string;
  description: string;
  imageUrl: string;
  ownerAddress?: string;
  creatorAddress: string;
  price: number;
}

class NFTRepository {
  async createNFT(nftData: NFTCreationData): Promise<INFT> {
    try {
      return await NFT.create(nftData);
    } catch (error) {
      console.error("Error creating NFT:", error);
      throw new Error("Failed to create NFT");
    }
  }

  async findByImageAndMetadataHash(
    metadataHash: string,
    imageHash: string
  ): Promise<INFT | null> {
    try {
      return await NFT.findOne({
        metadataUrl: metadataHash,
        imageUrl: imageHash,
      });
    } catch (error) {
      console.error("Error finding NFT by image and metadata hash:", error);
      throw new Error("Failed to find NFT by image and metadata hash");
    }
  }
}

const nftRepository = new NFTRepository();
export default nftRepository;
