import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const safeWrapperLogicFactory = await ethers.getContractFactory(
    "safeWrapperLogic"
  );
  let wrapperLogic = await safeWrapperLogicFactory.deploy();
  await wrapperLogic.deployed();

  console.log("Logic address:", wrapperLogic.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
