// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HeirManagement {
    address[] public heirs;

    event HeirsChanged(address[] newHeirs);

    modifier onlyHeir() {
        require(isHeir(msg.sender), "Only an heir can call this function");
        _;
    }

    constructor(address[] memory _heirs) {
        heirs = _heirs;
    }

    function setHeirs(address[] memory _newHeirs) public {
        heirs = _newHeirs;
        emit HeirsChanged(_newHeirs);
    }

    function isHeir(address _address) internal view returns (bool) {
        for (uint i = 0; i < heirs.length; i++) {
            if (heirs[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function getHeirs() public view returns (address[] memory) {
        return heirs;
    }
}
