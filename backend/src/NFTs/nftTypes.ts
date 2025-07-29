export interface IPFSUploadResponse {
  ipfsUrl: string;
  gatewayUrl: string;
}

export interface NFTMetadataUploadResponse {
  ipfsUrl: string;
  gatewayUrl: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export interface NFTCreationData {
  token_id?: string;
  contractAddress?: string;
  metadataUrl: string;
  name: string;
  description: string;
  imageUrl: string;
  ownerAddress: string;
  creatorAddress: string;
  price: number;
}
