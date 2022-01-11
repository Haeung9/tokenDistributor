const { assert } = require('chai');

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

const tokenDistributor = artifacts.require('tokenDistributor');
const tokenContract = artifacts.require('ERC20');

contract('tokenDistributor: functionalities on Token', async (accounts) => {
  let owner = accounts[0];
  let contractInstance;
  let tokenInstance;
  beforeEach(async () => {
    contractInstance = await tokenDistributor.new({from: owner});
    tokenInstance = await tokenContract.new("Infonet", "INFO", {from: owner});
  })
  context('Token deposit', async () => {
    it('single deposit, direct transfer',async () => {
      let result = await tokenInstance.transfer(contractInstance.address, '10', {from: owner});
      expect(result.receipt.status).to.equal(true);
      let recipantBalance = await contractInstance.reserveOfToken(tokenInstance.address);
      expect(recipantBalance.toString()).to.equal('10');
    });
    it('single deposit, deposit via approve',async () => {
      await tokenInstance.approve(contractInstance.address,'15', {from: owner})
      let result = await contractInstance.depositTokens([tokenInstance.address,], ['15',], {from: owner});
      expect(result.receipt.status).to.equal(true);
      let recipantBalance = await contractInstance.reserveOfToken(tokenInstance.address);
      expect(recipantBalance.toString()).to.equal('15');
    });
    it('multiple deposit', async() => {
      await tokenInstance.transfer(accounts[1], '100', {from: owner});
      await tokenInstance.approve(contractInstance.address, '100', {from: accounts[1]});
      await tokenInstance.transfer(contractInstance.address, '50', {from: owner});
      await contractInstance.depositTokens([tokenInstance.address,], ['100', ], {from: accounts[1]});
      let userbalance = await tokenInstance.balanceOf(accounts[1]);
      let contractbalance = await contractInstance.reserveOfToken(tokenInstance.address);
      expect(userbalance.toString()).to.equal('0');
      expect(contractbalance.toString()).to.equal('150');
    });
  });
  context('equallyDistributeTokenFromReserve', async () => {
    it('only owner', async () => {
      try {
        await contractInstance.equallyDistributeTokenFromReserve(tokenInstance.address, [accounts[1],], { from: accounts[1] })
        assert.fail('Could not catch error')
      } catch (error) {
        expect(error.message).to.include('not the owner')
      }
    });
    it('distribute to an account', async () => {
      await tokenInstance.transfer(contractInstance.address,'100', { from: owner })
      await contractInstance.equallyDistributeTokenFromReserve(tokenInstance.address, [accounts[1],], {from: owner})
      let userBalance = await tokenInstance.balanceOf(accounts[1])
      let contractBalance = await tokenInstance.balanceOf(contractInstance.address)
      expect(userBalance.toString()).to.equal('100')
      expect(contractBalance.toString()).to.equal('0')
    });
    it('distribute to multiple accounts', async () => {
      await tokenInstance.transfer(contractInstance.address,'100', { from: owner })
      await contractInstance.equallyDistributeTokenFromReserve(tokenInstance.address, [accounts[1], accounts[2]], {from: owner})
      let userBalanceA = await tokenInstance.balanceOf(accounts[1])
      let userBalanceB = await tokenInstance.balanceOf(accounts[2])
      let contractBalance = await tokenInstance.balanceOf(contractInstance.address)
      expect(userBalanceA.toString()).to.equal('50')
      expect(userBalanceB.toString()).to.equal('50')
      expect(contractBalance.toString()).to.equal('0')
    });
  });
  context('equallyDistributeToken', async () => {
    it('no approval', async () => {
      try {
        await contractInstance.equallyDistributeToken(tokenInstance.address, [accounts[1],], '100')
        assert.fail('Could not catch error')
      } catch (error) {
        expect(error.message).to.include('exceeds allowance')
      }
    })
    it('exceeds allowance', async () => {
      await tokenInstance.approve(contractInstance.address,'50', {from: owner})
      try {
        await contractInstance.equallyDistributeToken(tokenInstance.address, [accounts[1],], '100')
        assert.fail('Could not catch error')
      } catch (error) {
        expect(error.message).to.include('exceeds allowance')
      }
    })
    it('distribute to an account', async () => {
      await tokenInstance.approve(contractInstance.address,'100', {from: owner})
      await contractInstance.equallyDistributeToken(tokenInstance.address, [accounts[1],], '100', {from: owner})
      let userBalance = await tokenInstance.balanceOf(accounts[1])
      expect(userBalance.toString()).to.equal('100')
    })
    it('distribute to multiple accounts', async () => {
      await tokenInstance.approve(contractInstance.address,'100', {from: owner})
      await contractInstance.equallyDistributeToken(tokenInstance.address, [accounts[1],accounts[2]], '100', {from: owner})
      let userBalanceA = await tokenInstance.balanceOf(accounts[1])
      let userBalanceB = await tokenInstance.balanceOf(accounts[2])
      expect(userBalanceA.toString()).to.equal('50')
      expect(userBalanceB.toString()).to.equal('50')
    })
  })
})