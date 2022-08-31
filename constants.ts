import { AbiItem } from "web3-utils";

/* ================ PROVIDER ================== */

export const PROVIDER_RINKEBY =
  "https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_";

// export const PROVIDER_RINKEBY =
//   "https://rinkeby.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
export const PROVIDER_XDAI = "https://rpc.gnosischain.com";

/* ================ MODIFIER ================== */

export const BUDGET_MODIFIER_LOGIC_ADDRESS =
  "0xf83a477B3971a6d38c7e82587232B59CF108D8B6";
export const BUDGET_MODIFIER_PROXY_ADDRESS =
  "0xF5a024A9d55A70C0df8baF514F235FD823C0672E";

/* =============== SAFE WRAPPER =============== */

export const SAFE_WRAPPER_LOGIC_ADDRESS =
  "0x9551721628E7e17B28AAa7AC663BEb9557646293";
export const SAFE_WRAPPER_ADDRESS = "";

/* ================= FACTORY =================== */
//0x8C4e95e85c466Cb445eE46C63f6bB8280de29079
// 0x07EbC22196Bd797D7B9a959E21Af674b54b37FE8
export const WRAPPER_FACTORY_ADDRESS =
  "0x8C4e95e85c466Cb445eE46C63f6bB8280de29079";
export const WRAPPER_FACTORY_LOGIC_ADDRESS = "";
export const WRAPPER_FACTORY_PROXY_ADDRESS =
  "0x07EbC22196Bd797D7B9a959E21Af674b54b37FE8";
export const SAFE_WRAPPER_PROXY_ADDRESS = "";

/* ============= PERMISSION REG ================ */

export const PERMISSION_REG_LOGIC_ADDRESS =
  "0xAD7aF45b67d716974f69F2240F56Cffc6323fd4B";
export const PERMISSION_REG_PROXY_ADDRESS =
  "0xE5E6100681a7685e6a7CDb30e3D919674b686c10";
export const LINK_EXEC =
  "https://arweave.net/MuUH8mNwj1wwz7YIwQOfonNX91NAPIfqwfqcLJ_MF90";
export const LINK_MEM =
  "https://arweave.net/t3KAjyXR0dYaMMBPSNHncyI9jrQYSEcKbB6FQ2q7msI";
export const LINK_CONTR =
  "https://arweave.net/mui_M0_b1Ud1g0VTpqGgb4DtPecz8vfz_gD7Az0JEU0";

/* ================= BRIDGE ==================== */

// xDAI
// export const BRIDGE_PROXY_ADDRESS_XDAI_FACTORY =
//   "0x0BCFe2b0c2128280D0D5ab9A13b0C2A62f5bffDC";
export const BRIDGE_PROXY_ADDRESS_XDAI_FACTORY =
  "0xC5feD2Db1ACd19789AF18ec709754F96A8Ac9133";
// export const BRIDGE_PROXY_ADDRESS_XDAI_PERM =
//   "0x6E2603B973507ECB02d38eB18De85c1d230175C1";
export const BRIDGE_PROXY_ADDRESS_XDAI_PERM =
  "0x961D1E73F70B1686fbA9eC559eF1dD2Ed62b8a7A";
export const BRIDGE_LOGIC_ADDRESS_XDAI =
  "0x1A6737B361EA6c099285c8711404a29Ec11E906C";
export const DUMMY_MODULE_ADDRESS_XDAI =
  "0x8e71c441B8125d3aA568059499998303772E37Bf";
export const BRIDGE_ADDRESS_XDAI = "0xc38D4991c951fE8BCE1a12bEef2046eF36b0FA4A";

// Rinkeby
export const DUMMY_AVATAR_ADDRESS_RINKEBY =
  "0x587bFE3aa20Ef9D6f1b8a522ace082f9d1FA9c02";
export const BRIDGE_LOGIC_ADDRESS_RINKEBY =
  "0xb6814D67a419C0201681B2cbcb2e8a769342EcE8";
export const BRIDGE_PROXY_ADDRESS_RINKEBY_FACTORY =
  "0x716d6831345177E503d1814bE17Cbdf7d2dDDC6F";
export const BRIDGE_PROXY_ADDRESS_RINKEBY_PERM =
  "0xD8E9470DD86baA94CDFA81ED8bac68220d03f176";
export const BRIDGE_ADDRESS_RINKEBY =
  "0xD4075FB57fCf038bFc702c915Ef9592534bED5c1";

/* ================ TREASURY ================== */

export const GNOSIS_SAFE_AVATAR = "0x529F7DbD167ea367f72d95589DA986d2575F84e7";
export const GNOSIS_SAFE_FACTORY = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";
export const GNOSIS_SAFE_LOGIC = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";

/* =============== GOVERNANCE ================= */

// V1
export const TIMELOCK_ADDRESS = "0x1D79f025Ef520F3236c0faf6Dc796973ddeBC425";
export const GOVERNOR_ADDRESS = "0x7C2a05965E2802465D3B89E697fADc4CE12478cd";
export const VOTING_DUMMY_ADDRESS =
  "0x105fc1B7D6b1C1A91385a680e5b6Bd23e591d678";

// V2
// export const TOKEN_ADDRESS = "0x18C20822BA74cB1e54C0EE1EbAaC631eE229A7D1";
export const TOKEN_ADDRESS = "0x64d7E09B33EE0aC2A0901E5BEe1D1f877935a6c7";
// export const TIMELOCK_V2_ADDRESS = "0xFB4036CD76a842af77c3595d7B237fB6e93904ff";
export const TIMELOCK_V2_ADDRESS = "0x17e54194f38882D097A219D6a234A8BCFbb6C0Cf";
// export const GOVERNOR_V2_ADDRESS = "0x4D77fC13376D2FdD2665dEe918bfbDe331acc0d7";
export const GOVERNOR_V2_ADDRESS = "0x0774f0d92420F6BE3d556fd50762E6ce52001863";

/* =============== METHOD ABIS ================ */

export const FACTORY_METHOD_ABI: AbiItem = {
  inputs: [
    {
      internalType: "address",
      name: "module",
      type: "address",
    },
    {
      internalType: "address",
      name: "avatar",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "budget",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "interval",
      type: "uint256",
    },
    {
      internalType: "address",
      name: "mod",
      type: "address",
    },
    {
      internalType: "uint256",
      name: "saltNonce",
      type: "uint256",
    },
    {
      internalType: "address[]",
      name: "owners",
      type: "address[]",
    },
    {
      internalType: "uint256",
      name: "threshold",
      type: "uint256",
    },
    {
      internalType: "string",
      name: "name",
      type: "string",
    },
    {
      internalType: "string",
      name: "sector",
      type: "string",
    },
  ],
  name: "createSafeWrapperWithBudget",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function",
};
export const DUMMY_AVATAR_SUCCESS_METHOD_ABI: AbiItem = {
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
export const DUMMY_AVATAR_MODULE_METHOD_ABI: AbiItem = {
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
