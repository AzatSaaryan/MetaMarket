import { PinataSDK } from "pinata";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY;

if (!PINATA_JWT || !PINATA_GATEWAY)
  throw new Error(
    "Missing required environment variables: PINATA_JWT or PINATA_GATEWAY"
  );

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

export const uploadImageToIPFS = async (file: Express.Multer.File) => {
  if (!file || !file.path || !file.originalname || !file.mimetype)
    throw new Error("Invalid file input");

  const buffer = fs.readFileSync(file.path);

  const ipfsFile = new File([buffer], file.originalname, {
    type: file.mimetype,
  });

  const upload = await pinata.upload.public.file(ipfsFile);
  if (!upload) throw new Error("Failed to upload file to IPFS");

  if (file.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.warn("Failed to delete temporary file:", err);
    }
  }

  return {
    ipfsUrl: `ipfs://${upload.cid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${upload.cid}`,
  };
};

export const uploadMetadataToIPFS = async (data: {
  name: string;
  description: string;
  image: string;
}) => {
  if (!data.name || !data.description)
    throw new Error("Missing required metadata fields: name, description...");

  const metadataFile = new File(
    [JSON.stringify(data, null, 2)],
    "metadata.json",
    {
      type: "application/json",
    }
  );

  const upload = await pinata.upload.public.json(metadataFile);
  if (!upload) throw new Error("Failed to upload metadata to IPFS");

  return {
    ipfsUrl: `ipfs://${upload.cid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${upload.cid}`,
  };
};
