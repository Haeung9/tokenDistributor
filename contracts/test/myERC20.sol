pragma solidity ^0.8.21;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract myERC20 is ERC20 {
    uint private _initialSupply = 1000000 * (10**18);
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, _initialSupply);
    }
}