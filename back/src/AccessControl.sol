// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IDataTypes.sol";

contract AccessControl is IDataTypes {
 
    mapping(address => Members) private members;
    mapping(uint256 => Batch) public batches;

    
    modifier onlyRole(Role role) {
        require(members[msg.sender].role == role, "Unauthorized");
        require(members[msg.sender].isActive, "Account inactive");
        _;
    }

    function addMember(address account, Role role) external onlyRole(Role.ADMIN) {
        members[account] = Members(account, role, true);
    }
} 