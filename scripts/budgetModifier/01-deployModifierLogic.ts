import { ethers } from "hardhat";

async function main() {
  // DEPLOYMENT
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const modifierFactory = await ethers.getContractFactory(
    "budgetModifierLogic"
  );
  let budgetModifier = await modifierFactory.deploy();
  await budgetModifier.deployed();
  console.log("Modifier address:", budgetModifier.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
