import { ethers } from "hardhat";
import { GNOSIS_SAFE_AVATAR } from "../../constants";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const testModuleFactory = await ethers.getContractFactory("safeWrapper");
  let testModule = await testModuleFactory.deploy(
    GNOSIS_SAFE_AVATAR,
    deployer.address,
    "test committe",
    "test sector"
  );
  await testModule.deployed();

  console.log("module address:", testModule.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
