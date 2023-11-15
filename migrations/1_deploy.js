var tokenDistributor = artifacts.require('tokenDistributor');

module.exports = async function(deployer, network) {
    await deployer.deploy(tokenDistributor);
    if (network == 'sepolia') {
        let contractAddress = (await tokenDistributor.deployed()).address;
        console.log('deployed sepolia network, address: ', contractAddress);
    }
}