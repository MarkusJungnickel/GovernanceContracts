import { ethers } from "hardhat";
import Web3 from "web3";
import { FACTORY_ABI } from "../../ABIs/FACTORY_ABI";
import {
  BUDGET_MODIFIER_PROXY_ADDRESS,
  PROVIDER_RINKEBY,
  WRAPPER_FACTORY_PROXY_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and account
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const factory = new web3.eth.Contract(
  FACTORY_ABI,
  WRAPPER_FACTORY_PROXY_ADDRESS
);

async function main() {
  const [deployer] = await ethers.getSigners();

  let gas_1 = await factory.methods
    .createSafeWrapperWithBudget(
      deployer.address,
      deployer.address,
      1000000,
      0,
      BUDGET_MODIFIER_PROXY_ADDRESS,
      12909101,
      [deployer.address],
      1,
      "t",
      "t"
    )
    .estimateGas();

  gas_1 = Math.trunc(gas_1 * 1.1);

  const transaction_1 = factory.methods.createSafeWrapperWithBudget(
    deployer.address,
    deployer.address,
    1000000,
    0,
    BUDGET_MODIFIER_PROXY_ADDRESS,
    12909101,
    [deployer.address],
    1,
    "t",
    "t"
  );

  console.log("pre Transaction...");
  await sendTransaction(WRAPPER_FACTORY_PROXY_ADDRESS, transaction_1, gas_1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function sendTransaction(to: string, transaction: any, gasEstimate: any) {
  console.log("in  Transaction...");
  const options = {
    to: to,
    data: transaction.encodeABI(),
    gas: gasEstimate,
  };
  const signed = await web3.eth.accounts.signTransaction(
    options,
    PRIVATE_KEY_DEPLOYER
  );
  console.log("Sending Transaction...");
  const receipt = await web3.eth
    .sendSignedTransaction(signed.rawTransaction!)
    .once("confirmation", function (confNumber, receipt) {
      console.log(confNumber, receipt);
    })
    .catch((error) => {
      console.log(error);
    });
  console.log("Transaction Complete");
}
