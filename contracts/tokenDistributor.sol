// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract tokenDistributor is Ownable {
    address private _owner;
    receive() external payable {}
    constructor() Ownable(msg.sender) {}
    function reserveOfToken(address token) external view returns (uint) {
        return IERC20(token).balanceOf(address(this));
    }
    function reserveOfETH() external view returns (uint) {
        return address(this).balance;
    }
    function depositTokens(address[] memory tokens, uint[] memory amounts) external {
        require(tokens.length == amounts.length, "tokenDistributor: invalid input.");
        for(uint i=0; i<tokens.length; i++){
            require(IERC20(tokens[i]).allowance(msg.sender, address(this)) >= amounts[i], "tokenDistributor: amount exceeds allowance.");
            IERC20(tokens[i]).transferFrom(msg.sender,address(this), amounts[i]);
        }
    }
    function equallyDistributeTokenFromReserve(address token, address[] memory accounts) onlyOwner public {
        uint amountPerAccount = IERC20(token).balanceOf(address(this))/accounts.length;
        for(uint i=0; i<accounts.length; i++){
            IERC20(token).transfer(accounts[i], amountPerAccount);
        }
    }
    function equallyDistributeETHFromReserve(address payable[] memory accounts) onlyOwner public {
        uint amountPerAccount = address(this).balance/accounts.length;
        for(uint i=0; i<accounts.length; i++){
            accounts[i].transfer(amountPerAccount);
        }
    }
    function equallyDistributeToken(address token, address[] memory accounts, uint amount) public {
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "tokenDistributor: amount exceeds allowance.");
        uint amountPerAccount = amount/accounts.length;
        for(uint i=0; i<accounts.length; i++){
            IERC20(token).transferFrom(msg.sender, accounts[i], amountPerAccount);
        }
    }
}