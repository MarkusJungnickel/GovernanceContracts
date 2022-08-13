import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";

// Set Provider and Wallet
const provider =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";
const web3 = new Web3(provider);
chai.use(solidity);

let permissionReg: Contract;
let deployer: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

let withdraw_sig = web3.eth.abi.encodeFunctionSignature("withdrawAll()");
let spend_sig = web3.eth.abi.encodeFunctionSignature("spend()");
let fund_sig = web3.eth.abi.encodeFunctionSignature("fund()");

// role 5 i.e. 0110
const owner_role = 5;
const ownerLink =
  "https://arweave.net/_K_I3nugs8OnAv1eGtY4Fuzq2-8-ebtUc4BAApa2I74";
// role 14 i.e. 1111
const user_role = 14;
const userLink =
  "https://arweave.net/ZfIJ2yB-Lt5mQ8dhKmpNrGasdwY7O2w3_BQhJEzi0Io";

before(async () => {
  await getAddresses();
  const permissionRegFactory = await ethers.getContractFactory(
    "permissionRegistry"
  );
  permissionReg = await permissionRegFactory.deploy();
  await permissionReg.deployed();

  // Setup
  permissionReg.setLink(owner_role, ownerLink);
  permissionReg.setLink(user_role, userLink);
  console.log(
    `Contracts have been deployed: \nReg: ${permissionReg.address}\n`
  );
});

describe("Adding Permissions", function () {
  it("Add One Permissions, no capabilities", async function () {
    await permissionReg.setUserRole(addr1.address, owner_role, true);
    expect(
      await permissionReg.canCall(
        addr1.address,
        permissionReg.address,
        withdraw_sig
      )
    ).to.equal(false);
  });
  it("Add Second Permission, no capabilities", async function () {
    await permissionReg.setUserRole(addr2.address, user_role, true);
    expect(
      await permissionReg.canCall(
        addr2.address,
        permissionReg.address,
        withdraw_sig
      )
    ).to.equal(false);
  });
  it("Add capabilities", async function () {
    await permissionReg.setRoleCapability(
      owner_role,
      permissionReg.address,
      withdraw_sig,
      false
    );
    await permissionReg.setRoleCapability(
      user_role,
      permissionReg.address,
      withdraw_sig,
      true
    );
    expect(
      await permissionReg.canCall(
        addr1.address,
        permissionReg.address,
        withdraw_sig
      )
    ).to.equal(false);
    expect(
      await permissionReg.canCall(
        addr2.address,
        permissionReg.address,
        withdraw_sig
      )
    ).to.equal(true);
  });
});

describe("Permission Denied", function () {
  it("Call sig that's not enabled for role", async function () {
    await permissionReg.setRoleCapability(
      owner_role,
      permissionReg.address,
      spend_sig,
      true
    );
    expect(
      await permissionReg.canCall(
        addr2.address,
        permissionReg.address,
        spend_sig
      )
    ).to.equal(false);
  });
  it("Call sig that is not enabled for anyone", async function () {
    expect(
      await permissionReg.canCall(
        addr2.address,
        permissionReg.address,
        fund_sig
      )
    ).to.equal(false);
  });
  it("Call sig that is disabled", async function () {
    expect(
      await permissionReg.canCall(
        addr1.address,
        permissionReg.address,
        spend_sig
      )
    ).to.equal(true);
    await permissionReg.setRoleCapability(
      owner_role,
      permissionReg.address,
      spend_sig,
      false
    );
    expect(
      await permissionReg.canCall(
        addr1.address,
        permissionReg.address,
        spend_sig
      )
    ).to.equal(false);
  });
});

describe("Minting NFTs", function () {
  it("NFT is minited on role addition", async function () {
    await permissionReg.setUserRole(addr3.address, owner_role, true);
    expect(await permissionReg.balanceOf(addr3.address)).to.equal(1);
    expect(await permissionReg.getNFT(addr3.address, owner_role)).to.equal(
      ownerLink
    );
  });
  it("NFT is burned on role subtraction", async function () {
    await permissionReg.setUserRole(addr3.address, owner_role, false);
    expect(await permissionReg.balanceOf(addr3.address)).to.equal(0);
    expect(await permissionReg.getNFT(addr3.address, owner_role)).to.equal("");
  });
  it("NFT metadata link", async function () {
    expect(await permissionReg.tokenURI(1005)).to.equal(ownerLink);
  });
});

// describe("Default Permissions", function () {
//   it("Enable Modification", async function () {});
// });

async function getAddresses() {
  var [deployerLoc, addr1Loc, addr2Loc, addr3Loc] = await ethers.getSigners();
  deployer = deployerLoc;
  addr1 = addr1Loc;
  addr2 = addr2Loc;
  addr3 = addr3Loc;
}
