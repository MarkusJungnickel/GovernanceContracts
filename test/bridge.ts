import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
const provider =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";
const web3 = new Web3(provider);
const dummyAvatarSuccessMethodABI: AbiItem = {
  inputs: [
    {
      internalType: "bool",
      name: "_success",
      type: "bool",
    },
  ],
  name: "setSuccess",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
};
const dummyAvatarModuleMethodABI: AbiItem = {
  inputs: [
    {
      internalType: "address",
      name: "to",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "value",
      type: "uint256",
    },
    {
      internalType: "bytes",
      name: "data",
      type: "bytes",
    },
    {
      internalType: "enum Enum.Operation",
      name: "operation",
      type: "uint8",
    },
  ],
  name: "execTransactionFromModule",
  outputs: [
    {
      internalType: "bool",
      name: "success",
      type: "bool",
    },
  ],
  stateMutability: "nonpayable",
  type: "function",
};

chai.use(solidity);

let dummyBridge: Contract;
let dummyModule: Contract;
let dummyAvatar: Contract;
let bridgeProxy: Contract;
let deployer: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

before(async () => {
  await getAddresses();
  const dummyAvatarFactory = await ethers.getContractFactory("dummyAvatar");
  dummyAvatar = await dummyAvatarFactory.deploy();
  await dummyAvatar.deployed();

  const dummyModuleFactory = await ethers.getContractFactory("dummyModule");
  dummyModule = await dummyModuleFactory.deploy();
  await dummyModule.deployed();

  const bridgeProxyFactory = await ethers.getContractFactory(
    "bridgeProxyLogic"
  );
  bridgeProxy = await bridgeProxyFactory.deploy();
  await bridgeProxy.deployed();

  const dummyBridgeFactory = await ethers.getContractFactory("dummyBridge");
  dummyBridge = await dummyBridgeFactory.deploy();
  await dummyBridge.deployed();

  const parameters = web3.eth.abi.encodeParameters(
    ["address", "address", "address", "address"],
    [
      dummyBridge.address,
      bridgeProxy.address,
      dummyAvatar.address,
      dummyModule.address,
    ]
  );
  await bridgeProxy.initialize(parameters);

  console.log(
    `Contracts have been deployed: \nModule: ${dummyModule.address}\nBridge: ${dummyBridge.address}\nProxy: ${bridgeProxy.address}\n`
  );
});

describe("Core Functionality", function () {
  it("Send Transaction to Bridge", async function () {
    const avatarFunctionCall = web3.eth.abi.encodeFunctionCall(
      dummyAvatarSuccessMethodABI,
      [true.toString()]
    );
    const data = web3.eth.abi.encodeFunctionCall(dummyAvatarModuleMethodABI, [
      dummyAvatar.address,
      "0",
      avatarFunctionCall,
      "0",
    ]);
    await dummyModule.exec(
      dummyAvatar.address,
      0,
      data,
      bridgeProxy.address,
      0
    );
    expect(await dummyAvatar.getSuccess()).to.equal(true);
  });
});

async function getAddresses() {
  var [deployerLoc, addr1Loc, addr2Loc, addr3Loc] = await ethers.getSigners();
  deployer = deployerLoc;
  addr1 = addr1Loc;
  addr2 = addr2Loc;
  addr3 = addr3Loc;
}
