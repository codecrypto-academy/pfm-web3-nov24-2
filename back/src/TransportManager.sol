// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IDataTypes.sol";
import "./AccessControl.sol";

contract TransportManager is AccessControl {
    function claimBatch(uint256 batchId) external onlyRole(Role.TRANSPORTER) {
        require(batches[batchId].status == BatchStatus.CLOSED, "Batch not ready");
        
        batches[batchId].currentHandler = msg.sender;
        batches[batchId].status = BatchStatus.IN_TRANSIT;
        emit BatchAssignedToTransporter(batchId, msg.sender);
    }

    function updateLocation(uint256 batchId, string memory location) external {
        require(batches[batchId].currentHandler == msg.sender, "Not handler");
        require(batches[batchId].status == BatchStatus.IN_TRANSIT, "Not in transit");
        
        batches[batchId].locations.push(location);
        emit LocationUpdated(batchId, location);
    }
} 