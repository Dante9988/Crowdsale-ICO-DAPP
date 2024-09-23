const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const main = async () => {
    const NAME = 'DragonAI';
    const SYMBOL = 'DRGN';
    const MAX_SUPPLY = '1000000';
    const PRICE = tokens(0.025);

    // Get Signers
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const user1 = signers[0];
    // Deploy Token
    const Token = await ethers.getContractFactory('Token');
    const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY);
    await token.deployed();
    console.log(`Token deployed to: ${token.address}\n`);
    // Deploy Crowdsale
    const Crowdsale = await ethers.getContractFactory('Crowdsale');
    const crowdsale = await Crowdsale.deploy(token.address, PRICE, tokens(MAX_SUPPLY));
    await crowdsale.deployed();
    console.log(`Crowdsale deployed to: ${crowdsale.address}\n`);

    const txn = await token.transfer(crowdsale.address, tokens(MAX_SUPPLY));
    await txn.wait();
    console.log(`Tokens sent to Crowdsale contract at hash: ${txn.hash}\n`)

    const whitelistTxn = await crowdsale.connect(deployer).addToWhitelist(user1.address);
    await whitelistTxn.wait();
    console.log(`Whitelist Txn Hash: ${whitelistTxn.hash}\n`);

    const setStartDateTxn = await crowdsale.connect(deployer).setStartDate(1727065141);
    await setStartDateTxn.wait();
    console.log(`Whitelist Txn Hash: ${setStartDateTxn.hash}\n`);

    const setEndDateTxn = await crowdsale.connect(deployer).setEndDate(1737068121);
    await setEndDateTxn.wait();
    console.log(`Whitelist Txn Hash: ${setEndDateTxn.hash}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});