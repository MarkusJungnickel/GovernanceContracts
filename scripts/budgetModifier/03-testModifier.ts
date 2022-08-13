import { ethers } from "hardhat";
import Web3 from "web3";
import { BUDGET_MODIFIER_ABI } from "../../ABIs/BUDGET_MODIFIER_ABI";
import {
  BUDGET_MODIFIER_PROXY_ADDRESS,
  PROVIDER_RINKEBY,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and account
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
const modifier = new web3.eth.Contract(
  BUDGET_MODIFIER_ABI,
  BUDGET_MODIFIER_PROXY_ADDRESS
);

async function main() {
  const [deployer] = await ethers.getSigners();

  let gas_1 = await modifier.methods
    .setFreeze("0xA7faC92DC176E3154d261548B1368f32d55Da67e")
    .estimateGas();
  gas_1 = Math.trunc(gas_1 * 1.1);
  const transaction_1 = modifier.methods.setFreeze(
    "0xA7faC92DC176E3154d261548B1368f32d55Da67e"
  );
  console.log("pre Transaction...");
  await sendTransaction(BUDGET_MODIFIER_PROXY_ADDRESS, transaction_1, gas_1);

  const budget = await modifier.methods
    .getBudget("0xA7faC92DC176E3154d261548B1368f32d55Da67e")
    .call();
  console.log(budget);
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
    });
  console.log("Transaction Complete");
}
