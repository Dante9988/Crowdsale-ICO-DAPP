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
    /** @type {SignerWithAddress} */
    let whitelisted;
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
        whitelisted = accounts[2];
        // Deploy crowdsale
        crowdsale = await Crowdsale.deploy(token.address, ether(1), tokens(1000000));
        // Send tokens to Crowdsale
        let txn = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000));
        await txn.wait();
        whitelistTxn = await crowdsale.connect(deployer).addToWhitelist(user1.address);
        await whitelistTxn.wait();
        let setStartDate = await crowdsale.connect(deployer).setStartDate(1727065141);
        await setStartDate.wait();
        let setEndDate = await crowdsale.connect(deployer).setEndDate(1827065141);
        await setEndDate.wait();
    });

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
        });

        describe('Failure', () => {
            it('rejects insufficient ETH', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted;
            });
            it('rejects insufficient Token', async () => {
                // try {
                //     await crowdsale.connect(user1).buyTokens(tokens(1), { value: 1 });
                // } catch (error) {
                //     console.log("Error message:", error.message)
                //     if (error.reason) {
                //         console.log("Revert reason:", error.reason);
                //     } else {
                //         console.log("Revert reason not available.");
                //     }
                // }
                
                await expect(crowdsale.connect(user1).buyTokens(tokens(2000000), { value: 20 })).to.be.reverted;
            });
        });
    });

    describe('Whitelist', () => {
        let whitelistTxn;
        describe('Success', () => {
            beforeEach(async () => {
                whitelistTxn = await crowdsale.connect(deployer).addToWhitelist(whitelisted.address);
                await whitelistTxn.wait();
            })
            it('returns whitelisted user', async () => {
                expect(await crowdsale.whitelisted(whitelisted.address)).to.be.true;
            });
            it('emits a buy event', async () => {
                await expect(whitelistTxn).to.emit(crowdsale, 'Whitelist').withArgs(whitelisted.address);
            });
        });

        describe('Failure', () => {
            it('only owner allowed to whitelist', async () => {
                await expect(crowdsale.connect(user1).addToWhitelist(deployer.address))
                .to.be.revertedWith('Caller must be owner');
            });
        });
    });

    describe('Remove from whitelist', () => {
        let removeWhitelistTxn;
        describe('Success', () => {
            beforeEach(async () => {
                let whitelistTxn = await crowdsale.connect(deployer).addToWhitelist(whitelisted.address);
                await whitelistTxn.wait();

                removeWhitelistTxn = await crowdsale.connect(deployer).removeFromWhitelist(whitelisted.address);
                await removeWhitelistTxn.wait();
            })
            it('returns whitelisted user', async () => {
                expect(await crowdsale.whitelisted(whitelisted.address)).to.be.false;
            });
            it('emits a buy event', async () => {
                await expect(removeWhitelistTxn).to.emit(crowdsale, 'RemoveWhitelist').withArgs(whitelisted.address);
            });
        });

        describe('Failure', () => {
            it('only owner allowed to whitelist', async () => {
                await expect(crowdsale.connect(user1).removeFromWhitelist(deployer.address))
                .to.be.revertedWith('Caller must be owner');
            });
        });
    });

    describe('Start Date', () => {
        let amount = tokens(10);
        let timestamp = 2827065141;
        let setStartDateTxn;
        beforeEach(async () => {
            setStartDateTxn = await crowdsale.connect(deployer).setStartDate(timestamp); // 1827065141 - Future timestamp, very long time
            await setStartDateTxn.wait();
        });

        describe('Success', () => {
            it('emits set start date event', async () => {
                await expect(setStartDateTxn).to.emit(crowdsale, 'SetStartDate').withArgs(timestamp);
            });
        })

        describe('Failure', () => {
            it('rejects closed sale', async () => {
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})).to.be.revertedWith('Sale is not Live.');
            });
        });
    });

    describe('End Date', () => {
        let amount = tokens(10);
        let timestamp = 1727065142;
        let setEndDateTxn;
        beforeEach(async () => {
            setEndDateTxn = await crowdsale.connect(deployer).setEndDate(timestamp); // 1727065146 - Timestamp already in the past but greater than setStartDate value
            await setEndDateTxn.wait();
        });

        describe('Success', () => {
            it('emits set end date event', async () => {
                await expect(setEndDateTxn).to.emit(crowdsale, 'SetEndDate').withArgs(timestamp);
            });
        })

        describe('Failure', () => {
            it('rejects ended sale', async () => {
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})).to.be.revertedWith('Sale ended.');
            });
        });
    });

    describe('Sending ETH', () => {
        describe('Success', () => {
            let txn, result;
            let amount = ether(10);
            beforeEach(async () => {
                //txn = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)});
                txn = await user1.sendTransaction({ to: crowdsale.address, value: amount })
                result = await txn.wait();
            });
            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount);
            });
            it('updates user token balance', async () => {
                expect(await token.balanceOf(user1.address)).to.eq(amount);
            });
        });
    });

    describe('Updating Price', () => {
        let txn, result;
        let price = ether(2);
        describe('Success', () => {
            beforeEach(async () => {
                txn = await crowdsale.connect(deployer).setPrice(price);
                result = await txn.wait();
            });
            it('updates the price', async () => {
                expect(await crowdsale.price()).to.eq(ether(2));
            });
        });
        describe('Failure', () => {
            it('prevents non-owner from updating price', async () => {
                await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted;
            });
        });
    });

    describe('Finalizing Sale', () => {
        let txn, result;
        let amount = tokens(10);
        let value = ether(10);

        describe('Success', () => {
            
            beforeEach(async () => {
                //txn = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)});
                txn = await crowdsale.connect(user1).buyTokens(amount, {value: value});
                result = await txn.wait();

                txn = await crowdsale.connect(deployer).finalize();
                result = await txn.wait();
            });
            it('transfers remaining tokens to owner', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.eq(0);
                expect(await token.balanceOf(deployer.address)).to.eq(tokens(999990));
            });
            it('transfers ETH balance to owner', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(0);
            });
            it('emits Finalize event', async () => {
                await expect(txn).to.emit(crowdsale, 'Finalize').withArgs(amount, value);
            });
        });

        describe('Failure', () => {
            it('prevents non-owner from finalizing', async () => {
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted;
            });
        });
    });
});
