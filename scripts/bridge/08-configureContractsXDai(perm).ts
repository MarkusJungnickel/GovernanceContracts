import { ethers } from "hardhat";
import Web3 from "web3";
import { BRIDGE_LOGIC_ABI } from "../../ABIs/BRIDGE_LOGIC_ABI";
import {
  BRIDGE_ADDRESS_XDAI,
  BRIDGE_PROXY_ADDRESS_RINKEBY_PERM,
  BRIDGE_PROXY_ADDRESS_XDAI_PERM,
  PERMISSION_REG_PROXY_ADDRESS,
  PROVIDER_XDAI,
  TIMELOCK_V2_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and Wallet

const web3 = new Web3(PROVIDER_XDAI);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const proxy = new web3.eth.Contract(
  BRIDGE_LOGIC_ABI,
  BRIDGE_PROXY_ADDRESS_XDAI_PERM
);

async function main() {
  const [deployer] = await ethers.getSigners();
  const parametersProxy = web3.eth.abi.encodeParameters(
    ["address", "address", "address", "address"],
    [
      BRIDGE_ADDRESS_XDAI,
      BRIDGE_PROXY_ADDRESS_RINKEBY_PERM,
      PERMISSION_REG_PROXY_ADDRESS,
      deployer.address,
    ]
  );

  // let gas_1 = await proxy.methods.initialize(parametersProxy).estimateGas();
  // gas_1 = Math.trunc(gas_1 * 1.1);
  // const transaction_1 = proxy.methods.initialize(parametersProxy);
  // console.log("pre Transaction...");
  // await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI_PERM, transaction_1, gas_1);

  // let gas_2 = await proxy.methods
  //   .enableModule(DUMMY_MODULE_ADDRESS_XDAI)
  //   .estimateGas();
  // gas_2 = Math.trunc(gas_2 * 1.1);
  // const transaction_2 = proxy.methods.enableModule(DUMMY_MODULE_ADDRESS_XDAI);
  // console.log("pre Transaction...");
  // await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI, transaction_2, gas_2);

  let gas_3 = await proxy.methods
    .enableModule(TIMELOCK_V2_ADDRESS)
    .estimateGas();
  gas_3 = Math.trunc(gas_3 * 1.1);
  const transaction_3 = proxy.methods.enableModule(TIMELOCK_V2_ADDRESS);
  console.log("pre Transaction...");
  await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI_PERM, transaction_3, gas_3);

  // let gas_5 = await proxy.methods.setRequestGasLimit(3000000).estimateGas();
  // gas_5 = Math.trunc(gas_5 * 1.1);
  // const transaction_5 = proxy.methods.setRequestGasLimit(3000000);
  // console.log("pre Transaction...");
  // await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI_PERM, transaction_5, gas_5);

  // console.log(await proxy.methods.requestGasLimit().call());
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
