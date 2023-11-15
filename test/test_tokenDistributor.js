const tokenDistributor = artifacts.require('tokenDistributor');
const myERC20 = artifacts.require('myERC20');

contract('tokenDistributor', async (accounts) => {
    const owner = accounts[0];
    const user = accounts[1];
    const ONEETH = web3.utils.toBN(web3.utils.toWei("1"));
    let instance;
    let token0;
    let token1;
    let initialSupply;
    beforeEach(async () => {
        instance = await tokenDistributor.new({from: owner});
        token0 = await myERC20.new('test token 0', 'TST0');
        token1 = await myERC20.new('test token 1', 'TST1');
        initialSupply = web3.utils.toBN(await token0.totalSupply())
    });
    it('owner', async () => {
        const contractOwner = await instance.owner();
        expect(contractOwner).to.equal(owner);
    });
    it('distribute ETH from reserve by owner', async () => {
        const tx = await web3.eth.sendTransaction({from: owner, to: instance.address, value: ONEETH});
        const balance = (await instance.reserveOfETH()).toString();
        expect(balance).to.equal(ONEETH.toString());

        const userBalanceInitial = web3.utils.toBN(await web3.eth.getBalance(user));
        await instance.equallyDistributeETHFromReserve([user]);
        const userBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(user));
        expect(userBalanceAfter.toString()).to.equal(ONEETH.add(userBalanceInitial).toString());
    });
    it('distribute ETH from reserve by others', async () => {
        const tx = await web3.eth.sendTransaction({from: owner, to: instance.address, value: ONEETH});
        const balance = (await instance.reserveOfETH()).toString();
        expect(balance).to.equal(ONEETH.toString());

        try {
            await instance.equallyDistributeETHFromReserve([user], {from: user});
            expect.fail('should throw');
        } catch(err) {
            expect(err.message).to.include('revert');
        }
    });
    it('distribute Token from reserve', async () => {
        await token0.approve(instance.address, initialSupply, {from: owner});
        await instance.depositTokens([token0.address], [initialSupply]);
        expect((await token0.balanceOf(owner)).toString()).to.equal(web3.utils.toBN('0').toString());
        expect((await token0.balanceOf(instance.address)).toString()).to.equal(initialSupply.toString())

        await instance.equallyDistributeTokenFromReserve(token0.address, [user]);
        expect((await token0.balanceOf(user)).toString()).to.equal(initialSupply.toString());

        await token1.transfer(instance.address, initialSupply, {from: owner});
        await instance.equallyDistributeTokenFromReserve(token1.address, [owner, user]);
        expect((await token1.balanceOf(user)).toString()).to.equal(initialSupply.div(web3.utils.toBN('2')).toString());
        expect((await token1.balanceOf(owner)).toString()).to.equal(initialSupply.div(web3.utils.toBN('2')).toString());
    });
    it('distribute Token', async () => {
        await token0.approve(instance.address, initialSupply, {from: owner});
        await instance.equallyDistributeToken(token0.address, [user], initialSupply);
        expect((await token0.balanceOf(user)).toString()).to.equal(initialSupply.toString());

        await token1.approve(instance.address, initialSupply, {from: owner});
        await instance.equallyDistributeToken(token1.address, [owner, user], initialSupply);
        expect((await token1.balanceOf(user)).toString()).to.equal(initialSupply.div(web3.utils.toBN('2')).toString());
        expect((await token1.balanceOf(owner)).toString()).to.equal(initialSupply.div(web3.utils.toBN('2')).toString());
    });
    it('deposite multiple tokens', async () => {
        await token0.approve(instance.address, initialSupply, {from: owner});
        await token1.approve(instance.address, initialSupply, {from: owner});
        await instance.depositTokens([token0.address, token1.address], [initialSupply, initialSupply]);
        expect((await token0.balanceOf(instance.address)).toString()).to.equal(initialSupply.toString());
        expect((await token1.balanceOf(instance.address)).toString()).to.equal(initialSupply.toString());
    })
})