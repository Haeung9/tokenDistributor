var chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

const tokenDistributor = artifacts.require('tokenDistributor');
const tokenContract = artifacts.require('ERC20');

contract('tokenDistributor: basic functionalities on Token', async (accounts) => {
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
  xcontext('equallyDistributeTokenFromReserve', async () => {
    xit('only owner', async () => {});
    xit('distribute to an account', async () => {});
    xit('distribute to multiple accounts', async () => {});
  });
})