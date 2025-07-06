require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

if (!process.env.ALCHEMY_NETWORK_URL || !process.env.PRIVATE_KEY) {
  throw new Error("❌ Missing ALCHEMY_NETWORK_URL or PRIVATE_KEY in .env");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_NETWORK_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "../src/artifacts",
  },
};


