import { Schema, Types, model, Document } from "mongoose";
import { z } from "zod";

const ipfsUrlRegex =
  /^ipfs:\/\/(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58})/;

const nftSchema = new Schema(
  {
    _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
    token_id: { type: Number },
    contractAddress: {
      type: String,
      lowercase: true,
    },
    blockchain: {
      type: String,
      enum: ["Sepolia"],
      default: "Sepolia",
    },
    metadataUrl: {
      type: String,
      match: ipfsUrlRegex,
    },
    name: { type: String, required: true, minlength: 1, maxlength: 256 },
    description: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      match: ipfsUrlRegex,
    },
    ownerAddress: {
      type: String,
      lowercase: true,
    },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    price: { type: Number, min: 0, required: true },
  },
  {
    timestamps: true,
    indexes: [
      { key: { token_id: 1, contractAddress: 1 }, unique: true },
      { key: { ownerAddress: 1 } },
      { key: { creatorAddress: 1 } },
    ],
  }
);

export const nftSchemaZod = z.object({
  _id: z
    .string()
    .optional()
    .transform((val) => (val ? new Types.ObjectId(val) : undefined)),
  token_id: z.number().int().positive("Token ID must be a positive integer"),
  contractAddress: z
    .string()
    .transform((addr) => addr.toLowerCase())
    .optional(),
  blockchain: z.literal("Sepolia").default("Sepolia"),
  metadataUrl: z
    .string()
    .refine((val) => ipfsUrlRegex.test(val), {
      message: "Must be IPFS (ipfs://...)",
    })
    .optional(),
  metadataGatewayUrl: z.string().url().optional(),
  imageUrl: z
    .string()
    .refine((val) => ipfsUrlRegex.test(val), {
      message: "Must be IPFS (ipfs://...)",
    })
    .optional(),
  imageGatewayUrl: z.string().url().optional(),
  name: z.string().min(1, "Name is required").max(256),
  description: z.string().min(1, "Description is required").max(2000),
  ownerAddress: z
    .string()
    .transform((addr) => addr.toLowerCase())
    .optional(),
  creatorAddress: z.string().transform((addr) => addr.toLowerCase()),
  price: z.number().nonnegative("Price must be positive").finite(),
});

export const inputMetadataSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  description: z.string().min(1, "Description is required").max(2000),
  creatorAddress: z.string().transform((addr) => addr.toLowerCase()),
  price: z
    .string()
    .transform(Number)
    .refine((n) => !isNaN(n) && n >= 0, {
      message: "Price must be a valid non-negative number",
    }),
});

export type INFT = z.infer<typeof nftSchemaZod> & Document;
export type InputMetadata = z.infer<typeof inputMetadataSchema>;

export const validateInputMetadata = (data: unknown): InputMetadata => {
  try {
    return inputMetadataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw new Error("Unknown validation error");
  }
};

const NFT = model<INFT>("NFT", nftSchema);
export default NFT;
