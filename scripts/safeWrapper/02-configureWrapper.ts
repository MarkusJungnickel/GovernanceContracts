import { ethers } from "hardhat";
import Web3 from "web3";
import { SAFE_WRAPPER_ABI } from "../../ABIs/SAFE_WRAPPER_ABI";
import {
  GNOSIS_SAFE_AVATAR,
  PROVIDER_RINKEBY,
  SAFE_WRAPPER_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

const web3 = new Web3(PROVIDER_RINKEBY);

const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

async function main() {
  const testWrapper = new web3.eth.Contract(
    SAFE_WRAPPER_ABI,
    SAFE_WRAPPER_ADDRESS
  );
  const [deployer] = await ethers.getSigners();

  let gas_1 = await testWrapper.methods
    .addAvatar(GNOSIS_SAFE_AVATAR)
    .estimateGas();
  gas_1 = Math.trunc(gas_1 * 1.1);
  const transaction_1 = testWrapper.methods.addAvatar(GNOSIS_SAFE_AVATAR);
  await sendTransaction(SAFE_WRAPPER_ADDRESS, transaction_1, gas_1);
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
