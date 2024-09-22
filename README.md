# DRGN ICO Crowdsale

This project demonstrates the deployment of smart contracts for a token and a crowdsale using Hardhat. The project contains two contracts: `Token.sol` and `Crowdsale.sol`. The project is set up to deploy the contracts using Hardhat scripts, and a frontend is available to interact with the crowdsale.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) v14+ or v16+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (npm is recommended for this project)
- [Hardhat](https://hardhat.org/) for Ethereum development

## Setup Instructions

1. **Install Dependencies**

   Install all the required packages by running the following command:

   ```bash
   yarn install
   ```
2. **Use .env file**

    Create ```.env``` file in root directory and get this secrets

    ```
    PRIVATE_KEY=
    ALCHEMY_API_KEY=
    ETHERSCAN_API_KEY=
    ```
3. **Run node and deploy contracts**

    Run local node with hardhat
    ```npx hardhat node```

    Deploy contract on local node
    ```npx hardhat run scripts/deploy.cjs --network localhost```

4. **Run web app ICO**

    Execute command
    ```
    npm run start
    ```

## Visit deployed site on flee.xyz
    https://puny-bear-whispering.on-fleek.app/

    Network sepolia or local hardhat node supported

## Contracts Deployed: 
    Token Address = 0xA8b709d8bc3659b2C649f2Cf13C64C6Cb453912E
    Crowdsale Address = 0xCC92cA7c15052E4A3f495ee85BD7f344E73019Db