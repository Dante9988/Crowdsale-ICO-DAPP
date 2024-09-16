"use strict";

const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");
const tokens = n => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};
describe('Token', () => {
  let token, deployer, receiver, exchange, name, symbol, decimals, totalSupply;
  beforeEach(async () => {
    name = 'Dragon Year';
    symbol = 'DRGN';
    decimals = 18;
    totalSupply = 1000000;
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(name, symbol, totalSupply);
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
  });
  describe('Deployment', () => {
    it('has correct name', async () => {
      expect(await token.name()).to.be.equal(name);
    });
    it('has correct symbol', async () => {
      expect(await token.symbol()).to.be.equal(symbol);
    });
    it('has correct decimals', async () => {
      expect(await token.decimals()).to.be.equal(decimals);
    });
    it('has correct totalSupply', async () => {
      expect(await token.totalSupply()).to.be.equal(tokens(totalSupply));
    });
    it('assigns totalSupply to deployer balance', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(tokens(totalSupply));
    });
  });
  describe('Apporval tokens', () => {
    let amount, txn, result;
    beforeEach(async () => {
      amount = tokens(1000);
      txn = await token.connect(deployer).approve(exchange.address, amount);
      result = await txn.wait();
    });
    describe('Sucess', () => {
      it('allocates an allowence for delegated token spending', async () => {
        expect(await token.allowence(deployer.address, exchange.address)).to.equal(amount);
      });
      it('emits approval event', async () => {
        const args = result.events[0].args;
        expect(result.events[0].event).to.equal('Approval');
        expect(args.from).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe('Failure', () => {
      it('rejects invalid recipent', async () => {
        const amount = tokens(1000);
        const invalidAddress = '0x0000000000000000000000000000000000000000';
        await expect(token.connect(deployer).approve(invalidAddress, amount)).to.be.reverted;
      });
    });
  });
  describe('Transfer tokens', () => {
    let amount, txn, result;
    describe('Success', () => {
      beforeEach(async () => {
        amount = tokens(1000);
        txn = await token.connect(deployer).transfer(receiver.address, amount);
        result = await txn.wait();
      });
      it('transfers amount to receiver', async () => {
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });
      it('emits transfer event', async () => {
        const args = result.events[0].args;
        expect(result.events[0].event).to.equal('Transfer');
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe('Failure', () => {
      const invalidAmount = tokens(2000000);
      it('rejects invalid amount', async () => {
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.reverted;
      });
    });
  });
  describe('Delegated Token Transfer', () => {
    let amount, txn, result;
    beforeEach(async () => {
      amount = tokens(1000);
      txn = await token.connect(deployer).approve(exchange.address, amount);
      result = await txn.wait();
    });
    describe('Success', () => {
      beforeEach(async () => {
        txn = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
        result = await txn.wait();
      });
      it('transfers token balances', async () => {
        expect(await token.balanceOf(deployer.address)).to.be.equal(tokens(999000));
        expect(tokens(await token.balanceOf(receiver.address))).to.be.equal(tokens(amount));
      });
      it('resets the allowence', async () => {
        expect(await token.allowence(deployer.address, exchange.address)).to.be.equal(0);
      });
      it('emits a transfer event', async () => {
        const event = result.events[0];
        const args = event.args;
        expect(event.event).to.equal('Transfer');
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe('Failure', async () => {
      it('Rejects insufficient amounts', async () => {
        const invalidAmount = tokens(2000000);
        txn = await token.connect(deployer).approve(exchange.address, invalidAmount);
        result = await txn.wait();
        await expect(token.connect(deployer).transferFrom(exchange.address, receiver.address, invalidAmount)).to.be.reverted;
      });
    });
  });
});