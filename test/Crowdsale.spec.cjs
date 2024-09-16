const { expect } = require('chai');
const { ethers } = require('hardhat');
const { SignerWithAddress } = require('@nomiclabs/hardhat-ethers/signers');
const { Contract } = require('ethers');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = tokens;

describe('Crowdsale', () => {
    /** @type {Contract} */
    let crowdsale;
    /** @type {Contract} */
    let token;
    /** @type {SignerWithAddress[]} */
    let accounts;
    /** @type {SignerWithAddress} */
    let deployer;
    /** @type {SignerWithAddress} */
    let user1;
    beforeEach(async () => {
        // Load contracts
        const Crowdsale = await ethers.getContractFactory('Crowdsale');
        const Token = await ethers.getContractFactory('Token');
        // Deploy tokens
        token = await Token.deploy('DragonAI', 'DRGN', '1000000');
        // Cpmfigure accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user1 = accounts[1]
        // Deploy crowdsale
        crowdsale = await Crowdsale.deploy(token.address, ether(1), tokens(1000000));
        // Send tokens to Crowdsale
        let txn = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000));
        await txn.wait();
    })

    describe('Deployment', () => {
        it('sends tokens to the Crowdsale contract', async () => {
            expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(1000000));
        });

        it('returns token address', async () => {
            expect(await crowdsale.price()).to.equal(ether(1));
        });

        it('returns token address', async () => {
            expect(await crowdsale.token()).to.equal(token.address);
        });
    });

    describe('Buy Tokens', () => {

        describe('Success', () => {
            let txn, result;
            let amount = tokens(10);
            beforeEach(async () => {
                txn = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)});
                result = await txn.wait();
            });

            it('transfers tokens', async () => {
                
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990));
                expect(await token.balanceOf(user1.address)).to.eq(amount);
            });
            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount);
            });
            it('updates tokensSold', async () => {
                expect(await crowdsale.tokensSold()).to.eq(amount);
            });
            it('updates maxTokens', async () => {
                expect(await crowdsale.maxTokens()).to.eq(tokens(999990));
            });
            it('emits a buy event', async () => {
                await expect(txn).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address);
            });
        })

        describe('Failure', () => {
            it('rejects insufficient ETH', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted;
            });
            it('rejects insufficient Token', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(2000000), { value: 20 })).to.be.reverted;
            });
        })
    })
});
