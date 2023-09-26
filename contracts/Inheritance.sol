// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HeirManagement.sol";

contract Inheritance is Ownable, HeirManagement {
    uint256 public lastWithdrawalTime;
    uint256 public constant WITHDRAWAL_INTERVAL = 30 days;

    constructor(address[] memory _heirs) HeirManagement(_heirs) {
        lastWithdrawalTime = block.timestamp;
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");

        payable(owner()).transfer(amount);
        lastWithdrawalTime = block.timestamp;
    }

    function claimOwnership() public onlyHeir {
        require(block.timestamp > lastWithdrawalTime + WITHDRAWAL_INTERVAL, "1 month has not passed since the last withdrawal");

        _transferOwnership(msg.sender);
        lastWithdrawalTime = block.timestamp;
    }

    fallback() external payable {}

    receive() external payable {}


}
