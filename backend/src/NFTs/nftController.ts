import { Request, Response, RequestHandler } from "express";
import nftService from "./nftService.js";
import { validateInputMetadata } from "./nftModel.js";

class NftController {
  public createNFT: RequestHandler = async (req: Request, res: Response) => {
    const image = req.file;
    const nftData = validateInputMetadata(req.body);

    if (!image || !nftData) {
      res.status(400).json({ message: "Image file and NFT data are required" });
      return;
    }

    try {
      const imageUpload = await nftService.uploadImage(image);

      if (!imageUpload) {
        res.status(500).json({ message: "Failed to upload image to IPFS" });
        return;
      }
      const { price, creatorAddress, ...metadataFields } = nftData;

      const metadata = {
        ...metadataFields,
        image: imageUpload.ipfsUrl,
      };

      const metadataUpload = await nftService.uploadMetadata(metadata);
      if (!metadataUpload) {
        res.status(500).json({ message: "Failed to upload metadata to IPFS" });
        return;
      }

      const nftCreationData = {
        ...nftData,
        ownerAddress: nftData.creatorAddress,
        imageUrl: imageUpload.ipfsUrl,
        metadataUrl: metadataUpload.ipfsUrl,
      };

      const createdNFT = await nftService.createNFT(nftCreationData);
      res.status(201).json(createdNFT);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating NFT:", error);
        res.status(500).json({ message: error.message });
        return;
      }
    }
  };
}

const nftController = new NftController();
export default nftController;
