import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const governorFactory = await ethers.getContractFactory("GovernorCoreV2");
  let governor = await governorFactory.deploy();
  await governor.deployed();

  console.log("xDai governor address:", governor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
