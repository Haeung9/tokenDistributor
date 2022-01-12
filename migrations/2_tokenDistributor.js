const tokenDistributor = artifacts.require("tokenDistributor");

module.exports = function (deployer) {
  deployer.deploy(tokenDistributor);
};
