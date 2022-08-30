import { ethers } from "hardhat";
import {
  GNOSIS_SAFE_FACTORY,
  GNOSIS_SAFE_LOGIC,
  SAFE_WRAPPER_LOGIC_ADDRESS,
} from "../../constants";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const safeWrapperFactoryFactory = await ethers.getContractFactory(
    "wrapperFactory"
  );

  let wrapperFactory = await safeWrapperFactoryFactory.deploy(
    SAFE_WRAPPER_LOGIC_ADDRESS,
    GNOSIS_SAFE_FACTORY,
    GNOSIS_SAFE_LOGIC,
    deployer.address
  );
  await wrapperFactory.deployed();

  console.log("Factory address:", wrapperFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
