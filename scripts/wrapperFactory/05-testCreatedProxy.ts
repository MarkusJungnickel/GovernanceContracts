import { ethers } from "hardhat";
import Web3 from "web3";
import { BUDGET_MODIFIER_ABI } from "../../ABIs/BUDGET_MODIFIER_ABI";
import { SAFE_WRAPPER_ABI } from "../../ABIs/SAFE_WRAPPER_ABI";
import {
  BUDGET_MODIFIER_PROXY_ADDRESS,
  GNOSIS_SAFE_AVATAR,
  PROVIDER_RINKEBY,
  SAFE_WRAPPER_PROXY_ADDRESS,
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
const startAddr = "0x0000000000000000000000000000000000000001";
const proxy = new web3.eth.Contract(
  SAFE_WRAPPER_ABI,
  SAFE_WRAPPER_PROXY_ADDRESS
);
const modifier = new web3.eth.Contract(
  BUDGET_MODIFIER_ABI,
  BUDGET_MODIFIER_PROXY_ADDRESS
);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Check deployer has module permissions...");
  const tx1 = await proxy.methods.isModuleEnabled(deployer.address).call();
  console.log(tx1);
  console.log("Check safe is enabled as an avatar...");
  const tx2 = await proxy.methods.isAvatarEnabled(GNOSIS_SAFE_AVATAR).call();
  console.log(tx2);
  console.log("Check modifier is enabled as an avatar...");
  const tx3 = await proxy.methods
    .isAvatarEnabled(BUDGET_MODIFIER_PROXY_ADDRESS)
    .call();
  console.log(tx3);
  console.log("Check Avatars paginated...");
  const tx4 = await proxy.methods.getAvatarsPaginated(startAddr, 50).call();
  console.log(tx4);

  console.log("Check Modules paginated...");
  const tx5 = await modifier.methods.getModulesPaginated(startAddr, 50).call();
  console.log(tx5);

  console.log("Check Avatars paginated...");
  const tx6 = await modifier.methods.getAvatarsPaginated(startAddr, 50).call();
  console.log(tx6);

  //   let gas_1 = await proxy.methods.enableAvatar(GnosisAvatar).estimateGas();
  //   gas_1 = Math.trunc(gas_1 * 1.1);
  //   const transaction_1 = proxy.methods.enableAvatar(GnosisAvatar);

  //   console.log("pre Transaction...");
  //   await sendTransaction(transaction_1, gas_1);

  //  let gas_2 = await proxy.methods
  //   .setTarget(modifierAddr, GnosisAvatar)
  //   .estimateGas();
  // gas_2 = Math.trunc(gas_2 * 1.1);
  // const transaction_2 = proxy.methods.setTarget(modifierAddr, GnosisAvatar);

  // console.log("pre Transaction...");
  // await sendTransaction(transaction_2, gas_2);

  //   let gas_3 = await modifier.methods.enableAvatar(GnosisAvatar).estimateGas();
  //   gas_3 = Math.trunc(gas_3 * 1.1);
  //   const transaction_3 = modifier.methods.enableAvatar(GnosisAvatar);

  //   console.log("pre Transaction...");
  //   await sendTransaction(transaction_3, gas_3);
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
