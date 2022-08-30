import { ethers } from "hardhat";
import Web3 from "web3";
import { BRIDGE_LOGIC_ABI } from "../../ABIs/BRIDGE_LOGIC_ABI";
import {
  BRIDGE_ADDRESS_RINKEBY,
  BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY,
  BRIDGE_PROXY_ADDRESS_XDAI_FACTORY,
  PROVIDER_RINKEBY,
  WRAPPER_FACTORY_PROXY_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

// Set Provider and Wallet
const web3 = new Web3(PROVIDER_RINKEBY);
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
const startAddr = "0x0000000000000000000000000000000000000001";
// Get Contracts
const proxy = new web3.eth.Contract(
  BRIDGE_LOGIC_ABI,
  BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY
);

async function main() {
  const [deployer] = await ethers.getSigners();
  const parametersLogic = web3.eth.abi.encodeParameters(
    ["address", "address", "address", "address"],
    [
      BRIDGE_ADDRESS_RINKEBY,
      BRIDGE_PROXY_ADDRESS_XDAI_FACTORY,
      WRAPPER_FACTORY_PROXY_ADDRESS,
      deployer.address,
    ]
  );
  // let gas_3 = await proxy.methods.initialize(parametersLogic).estimateGas();
  // gas_3 = Math.trunc(gas_3 * 1.1);
  // const transaction_3 = proxy.methods.initialize(parametersLogic);
  // console.log("pre Transaction...");
  // await sendTransaction(
  //   BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY,
  //   transaction_3,
  //   gas_3
  // );

  // let gas_4 = await proxy.methods
  //   .enableModule(TIMELOCK_V2_ADDRESS)
  //   .estimateGas();
  // gas_4 = Math.trunc(gas_4 * 1.1);
  // const transaction_4 = proxy.methods.enableModule(TIMELOCK_V2_ADDRESS);
  // console.log("pre Transaction...");
  // await sendTransaction(
  //   BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY,
  //   transaction_4,
  //   gas_4
  // );

  let gas_2 = await proxy.methods
    .enableAvatar(WRAPPER_FACTORY_PROXY_ADDRESS)
    .estimateGas();
  gas_2 = Math.trunc(gas_2 * 1.1);
  const transaction_2 = proxy.methods.enableAvatar(
    WRAPPER_FACTORY_PROXY_ADDRESS
  );
  console.log("pre Transaction...");
  await sendTransaction(
    BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY,
    transaction_2,
    gas_2
  );

  const success = await proxy.methods.getAvatarsPaginated(startAddr, 50).call();
  console.log(success);
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
