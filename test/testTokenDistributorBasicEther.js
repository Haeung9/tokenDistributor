var chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

const tokenDistributor = artifacts.require("tokenDistributor");

contract("tokenDistributor: basic functionalities on Ether", async (accounts) => {
    let [acc1, acc2, acc3, acc4, acc5] = accounts;
    let contractInstance;
    beforeEach(async () => {
        contractInstance = await tokenDistributor.new({from: acc1});
    });
    context('Deployment', async () => {
        it('owner should be the deployer', async () => {
            const contractOwner = await contractInstance.owner();
            expect(contractOwner).to.equal(acc1);
        });
        it('balances after deployment', async () => {
            const balanceA = await web3.eth.getBalance(acc1);
            const balanceB = await web3.eth.getBalance(acc2);
            expect(balanceA).to.not.equal(web3.utils.toWei("100","ether"));
            expect(balanceB).to.equal(web3.utils.toWei("100","ether"));
        });
    })
    context('Ether deposit', async () => {
        it('single deposit',async () => {
            let result = await contractInstance.send(web3.utils.toWei("1"),{from: acc1});
            expect(result.receipt.status).to.equal(true);
            let currentBalance = await contractInstance.reserveOfETH();
            //expect(web3.utils.isBN(currentBalance)).to.equal(true);
            expect(currentBalance.toString()).to.equal(web3.utils.toWei("1"));
        })
        it('multiple deposit', async() => {
            let result1 = contractInstance.send(web3.utils.toWei("1"),{from: acc1});
            let result2 = contractInstance.send(web3.utils.toWei("2"),{from: acc2});
            await Promise.all([result1, result2]);
            let currentBalance  = await contractInstance.reserveOfETH();
            expect(currentBalance.toString()).to.equal(web3.utils.toWei("3"));
        })
    })
    context('equallyDistributeETHFromReserve', async () => {
        it('only owner', async () => {
            let result = await contractInstance.equallyDistributeETHFromReserve([acc3,],{from: acc1});
            should.Throw;
        })
        it('distribute to an account', async () => {
            // let previousBalance3 = await web3.eth.getBalance(acc3);
            // expect(previousBalance3.toString()).to.equal(web3.utils.toWei("100"));
            await contractInstance.send(web3.utils.toWei("1"),{from: acc1});
            let result = await contractInstance.equallyDistributeETHFromReserve([acc3,],{from: acc1});
            let currentBalance  = await contractInstance.reserveOfETH();
            expect(currentBalance.toString()).to.equal(web3.utils.toWei("0"));
            let currentBalance3 = await web3.eth.getBalance(acc3);
            expect(currentBalance3.toString()).to.equal(web3.utils.toWei("101"));
        });
        it('distribute to multiple accounts', async () => {
            // let previousBalance3 = await web3.eth.getBalance(acc3);
            // expect(previousBalance3.toString()).to.equal(web3.utils.toWei("100"));
            await contractInstance.send(web3.utils.toWei("2"),{from: acc1});
            let result = await contractInstance.equallyDistributeETHFromReserve([acc4,acc5],{from: acc1});
            let currentBalance  = await contractInstance.reserveOfETH();
            expect(currentBalance.toString()).to.equal(web3.utils.toWei("0"));
            let currentBalance4 = await web3.eth.getBalance(acc4);
            expect(currentBalance4.toString()).to.equal(web3.utils.toWei("101"));
            let currentBalance5 = await web3.eth.getBalance(acc5);
            expect(currentBalance5.toString()).to.equal(web3.utils.toWei("101"));
        });
    })
})