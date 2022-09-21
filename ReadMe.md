# Governance Model Implementation

## Background

This repository was created for the purpose of my Master Thesis on Protocol/DAO Governance. It contains the smart contracts used to implement the governance model. See a summary of the thesis [here]((./SpringDAO_PPT_Final.pdf)).

## Test Website

You can test the contracts via [this](./https://main.druh7epd3cpu6.amplifyapp.com/) website.

## Contracts

The contracts are ordered by components. The core folder contains the abstract contracts implementing the Zodiac interfaces.

## Pre-Deployment Testing

Run all tests in the Hardhat Network by calling "yarn hardhat test"

## Deployment

First the contracts are deployed and the deployer address receives admin control. Once the contracts have been deployed, they are configured, by giving them access to each other and removing the deployers admin control.

The scripts need to be run in this order:

1. Deploy the permission registry
   - Registry Logic
   - Registry Proxy
2. Deploy the budget modifier
   - Modifier Logic
   - Modifier Proxy
3. Deploy the wrapper factory
   - Wrapper Logic
   - Factory Logic
   - Factory Proxy
4. Deploy the bridge
   - Proxy logic rinkeby
   - Proxy logic xDai
   - Proxy xDai for permission reg
   - Proxy xDai for wrapper
5. Deploy the gov V2 contracts
   - Token
   - GovernorCore
   - TimeLock
6. Configure the gov V2 contracts
   - initialize GovernorCore
   - enable avatar on timelock(2 bridge proxies)
7. Configure the bridge
   - enable Avatars(permission reg proxy, wrapper factory)
   - enable Modules(Timelock)
8. Configure permission reg
   - enable bridge proxy logic rinkeby as module
9. Configure budget modifier
   - enable wrapper factory as settings modifier
10. Configure wrapper factory
    - enable proxy logic rinkeby
11. Add permission reg to contracts
12. Enable Timelock on bridge proxies xDai

## Post-Deployment Testing

The scripts folder includes testing scripts for the deployed smart contracts to test functionalities that could not be tested well in the Hardhat Network.
