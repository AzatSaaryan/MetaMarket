import NFT, { INFT } from "./nftModel.js";
import { NFTCreationData } from "./nftTypes";

class NFTRepository {
  async createNFT(nftData: NFTCreationData): Promise<INFT> {
    return await NFT.create(nftData);
  }

  async findByImageAndMetadataHash(
    metadataHash: string,
    imageHash: string
  ): Promise<INFT | null> {
    return await NFT.findOne({
      metadataUrl: metadataHash,
      imageUrl: imageHash,
    });
  }
}

const nftRepository = new NFTRepository();
export default nftRepository;
