// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IDataTypes.sol";
import "./AccessControl.sol";

contract DonationManager is AccessControl {
    uint256 public constant MAX_PRODUCTS_PER_BATCH = 5;

    function addDonation(uint256 batchId, string memory productDescription) external onlyRole(Role.DONOR) 
    {
        require(batches[batchId].donations.length < MAX_PRODUCTS_PER_BATCH, "Batch is full");
        
        batches[batchId].donations.push(
            Donation({
                donor: msg.sender,
                description: productDescription,
                timestamp: block.timestamp,
                validated: true
            })
        );
        emit ProductAdded(batchId, batches[batchId].donations.length - 1, msg.sender);
    }
} 