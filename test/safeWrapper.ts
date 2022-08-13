import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";
import { PROVIDER_RINKEBY } from "../constants";

const web3 = new Web3(PROVIDER_RINKEBY);

chai.use(solidity);

let dummyAvatar: Contract;
let safeWrapper: Contract;
let deployer: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

before(async () => {
  await getAddresses();
  const dummyAvatarFactory = await ethers.getContractFactory("dummyAvatar");
  dummyAvatar = await dummyAvatarFactory.deploy();
  await dummyAvatar.deployed();

  const safeWrapperFactory = await ethers.getContractFactory("safeWrapperBase");
  safeWrapper = await safeWrapperFactory.deploy();
  await safeWrapper.deployed();
  // deployer acts as safe here

  const parameters = web3.eth.abi.encodeParameters(
    ["address", "address", "string", "string"],
    [deployer.address, deployer.address, "Hello!%", "Hello!%"]
  );
  await safeWrapper.initialize(parameters);
  console.log(
    `Contracts have been deployed: \nModule: ${safeWrapper.address}\nSafe: ${dummyAvatar.address}\n`
  );

  await setBalance(dummyAvatar.address, 10000000000000000000n);
});

describe("Core Functionality", function () {
  it("Adding one avatar", async function () {
    await safeWrapper.enableAvatar(dummyAvatar.address);
    //await safeWrapper.setTarget(addr2.address, dummyAvatar.address);
    expect(await safeWrapper.isAvatarEnabled(dummyAvatar.address)).to.equal(
      true
    );
  });
  it("Adding second avatar", async function () {
    await safeWrapper.enableAvatar(addr2.address);
    //await safeWrapper.setTarget(dummyAvatar.address, addr2.address);
    expect(await safeWrapper.isAvatarEnabled(addr2.address)).to.equal(true);
  });
});

describe("Wrapper Functionality", function () {
  it("Transferring eth to external address", async function () {
    const transferTx = await safeWrapper.sendEth(
      addr1.address,
      10,
      dummyAvatar.address
    );
    expect(await addr1.getBalance()).to.equal(10000000000000000000409n);
  });
});

async function getAddresses() {
  var [deployerLoc, addr1Loc, addr2Loc, addr3Loc] = await ethers.getSigners();
  deployer = deployerLoc;
  addr1 = addr1Loc;
  addr2 = addr2Loc;
  addr3 = addr3Loc;
}
