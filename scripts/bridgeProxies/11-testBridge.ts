import { ethers } from "hardhat";
import Web3 from "web3";
import { BRIDGE_LOGIC_ABI } from "../../ABIs/BRIDGE_LOGIC_ABI";
import { DUMMY_AVATAR_ABI } from "../../ABIs/DUMMY_AVATAR_ABI";
import { DUMMY_MODULE_ABI } from "../../ABIs/DUMMY_MODULE_ABI";
import { FACTORY_ABI } from "../../ABIs/FACTORY_ABI";
import {
  BRIDGE_PROXY_ADDRESS_XDAI_FACTORY,
  DUMMY_AVATAR_ADDRESS_RINKEBY,
  DUMMY_MODULE_ADDRESS_XDAI,
  PROVIDER_XDAI,
  WRAPPER_FACTORY_PROXY_ADDRESS,
} from "../../constants";
import { PRIVATE_KEY_DEPLOYER } from "../../privateKeys";

const wrapperJson =
  "/Users/markusjungnickel/Desktop/Ethereum/zodiac/artifacts/contracts/Proxy/factory/wrapperFactory.sol/wrapperFactory.json";
var fs = require("fs");
var parsed = JSON.parse(fs.readFileSync(wrapperJson));
var abi = parsed.abi;
const iface = new ethers.utils.Interface(abi);

// Set Provider and Wallet
// const web3 = new Web3(PROVIDER_RINKEBY);
const web3 = new Web3(PROVIDER_XDAI);

const startAddr = "0x0000000000000000000000000000000000000001";
const account = web3.eth.accounts.privateKeyToAccount(
  "0x" + PRIVATE_KEY_DEPLOYER
);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Get Contracts
const dummyModule = new web3.eth.Contract(
  DUMMY_MODULE_ABI,
  DUMMY_MODULE_ADDRESS_XDAI
);
const avatar = new web3.eth.Contract(
  DUMMY_AVATAR_ABI,
  DUMMY_AVATAR_ADDRESS_RINKEBY
);
const proxy = new web3.eth.Contract(
  BRIDGE_LOGIC_ABI,
  BRIDGE_PROXY_ADDRESS_XDAI_FACTORY
);

const wrapperFactory = new web3.eth.Contract(
  FACTORY_ABI,
  WRAPPER_FACTORY_PROXY_ADDRESS
);

async function main() {
  const [deployer] = await ethers.getSigners();

  const owners = [
    "0xd377e2f8f2bFA990C7Ca2988c82e175aE5Faa341",
    "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
  ];
  const salt = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  const data = iface.encodeFunctionData("createSafeWrapperWithBudget", [
    deployer.address,
    "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
    10000000,
    0,
    "0x48cFabE06FD3c9B0cC0C602dAa8b6e893Fc31d96",
    salt,
    owners,
    1,
    "xDai Committee",
    "xDai",
  ]);

  let gas_1 = await dummyModule.methods
    .exec(
      WRAPPER_FACTORY_PROXY_ADDRESS,
      0,
      data,
      BRIDGE_PROXY_ADDRESS_XDAI_FACTORY,
      0
    )
    .estimateGas();
  gas_1 = 3000000;
  const transaction_1 = dummyModule.methods.exec(
    WRAPPER_FACTORY_PROXY_ADDRESS,
    0,
    data,
    BRIDGE_PROXY_ADDRESS_XDAI_FACTORY,
    0
  );
  console.log("pre Transaction...");
  await sendTransaction(DUMMY_MODULE_ADDRESS_XDAI, transaction_1, gas_1);

  //   let gas_1 = await dummyModule.methods
  //     .exec(DUMMY_AVATAR_ADDRESS_RINKEBY, 0, data, BRIDGE_PROXY_ADDRESS_XDAI, 0)
  //     .estimateGas();

  // const success = await proxy.methods.getAvatarsPaginated(startAddr, 50).call();
  // console.log(success);
  // let gas_2 = await proxy.methods
  //   .enableAvatar(DUMMY_AVATAR_ADDRESS_RINKEBY)
  //   .estimateGas();
  // gas_2 = Math.trunc(gas_2 * 1.1);
  // const transaction_2 = proxy.methods.enableAvatar(
  //   DUMMY_AVATAR_ADDRESS_RINKEBY
  // );
  // console.log("pre Transaction...");
  // await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI, transaction_2, gas_2);

  // let gas_1 = 3000000;
  // const transaction_1 = wrapperFactory.methods.createSafeWrapperWithBudget(
  //   deployer.address,
  //   "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
  //   10000000,
  //   0,
  //   "0x48cFabE06FD3c9B0cC0C602dAa8b6e893Fc31d96",
  //   salt,
  //   owners,
  //   1,
  //   "xDai Committee",
  //   "xDai"
  // );

  // console.log("pre Transaction...");
  //await sendTransaction(BRIDGE_PROXY_ADDRESS_XDAI, transaction_1, gas_1);

  // const success = await avatar.methods.getSuccess().call();
  // console.log(success);
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
  await web3.eth
    .sendSignedTransaction(signed.rawTransaction!)
    .once("confirmation", function (confNumber, receipt) {
      console.log(confNumber, receipt);
    });
  console.log("Transaction Complete");
}
