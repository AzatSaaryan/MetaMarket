const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with address:", deployer.address);

  const MetaToken = await hre.ethers.getContractFactory("MetaToken");
  const contract = await MetaToken.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
