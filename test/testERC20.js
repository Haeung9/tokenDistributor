const { assert } = require('chai');

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

const ERC20 = artifacts.require("ERC20");

contract("ERC20", async(accounts) => {
    let owner = accounts[0];
    let contractInstance;
    beforeEach(async () => {
        contractInstance = await ERC20.new("Infonet", "INFO", {from: owner});
    });
    context('Deployment', async () => {
        it('name and symbol', async () => {
            const tokenName = await contractInstance.name();
            const tokenSymbol = await contractInstance.symbol();
            expect(tokenName).to.equal("Infonet");
            expect(tokenSymbol).to.equal("INFO");
        })
        it('minter should be the deployer', async () => {
            const contractOwner = await contractInstance.minter();
            expect(contractOwner).to.equal(owner);
        });
    })
    context('Token transfer', async () => {
        it('direct transfer', async () => {
            let result = await contractInstance.transfer(accounts[1],"10",{from: owner});
            expect(result.receipt.status).to.equal(true);
            let recipantBalance = await contractInstance.balanceOf(accounts[1]);
            expect(recipantBalance.toString()).to.equal("10");
        })
        it('approval', async () => {
            let result = await contractInstance.approve(accounts[1],'15', {from: owner});
            expect(result.receipt.status).to.equal(true);
            let spenderAllowance = await contractInstance.allowance(owner,accounts[1]);
            expect(spenderAllowance.toString()).to.equal('15');
        })
        it('transfer via approve', async () => {
            await contractInstance.approve(accounts[1],'10', {from: owner});
            let result = await contractInstance.transferFrom(owner, accounts[2], '10', {from: accounts[1]});
            expect(result.receipt.status).to.equal(true);
            let recipantBalance = await contractInstance.balanceOf(accounts[2]);
            expect(recipantBalance.toString()).to.equal('10');
        })
    })
    context('Token transfer should fail with:', async () => {
        it('exceeds balance', async () => {
            try {
                await contractInstance.transfer(accounts[1],'10', { from: accounts[2] })
                assert.fail('Could not catch error')
            } catch(error) {
                expect(error.message).to.include('exceeds balance')
            }
        });
        it('invalid spender', async () => {
            await contractInstance.approve(accounts[1],'10', {from: owner})
            try {
                await contractInstance.transferFrom(owner, accounts[1], '10', {from: accounts[2]})
                assert.fail('Could not catch error')
            } catch(error) {
                expect(error.message).to.include('exceeds allowance')
            }
        });
        it('exceeds allowance', async () => {
            await contractInstance.approve(accounts[1],'10', {from: owner})
            try {
                await contractInstance.transferFrom(owner, accounts[2], '20', {from: accounts[1]})
                assert.fail('Could not catch error')
            } catch (error) {
                expect(error.message).to.include('exceeds allowance')
            }
        });
        it('transfer to the zero address', async () => {
            const zeroAddress = '0x0000000000000000000000000000000000000000'
            try {
                await contractInstance.transfer(zeroAddress,'10', { from: owner })
                assert.fail('Could not catch error')
            } catch (error) {
                expect(error.message).to.include('zero address')
            }
        });
    })
})