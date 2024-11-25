 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./AccessControl.sol";
import "./IDataTypes.sol";

contract ProductBatchBase is ERC1155, AccessControl {

    uint256 public currentBatchId = 1;
    constructor() ERC1155("https://token-cdn-domain/{id}.json") {}

    function createBatch(string memory location) external onlyRole(Role.ADMIN) {
        _mint(msg.sender, currentBatchId, 1, "");
        
        Batch storage newBatch = batches[currentBatchId];
        newBatch.id = currentBatchId;
        newBatch.status = BatchStatus.OPEN;
        newBatch.currentHandler = msg.sender;
        newBatch.locations.push(location);
        
        emit BatchCreated(currentBatchId, msg.sender);
        currentBatchId++;
    }

    function closeBatch(uint256 batchId) external onlyRole(Role.ADMIN) {
        require(batches[batchId].status == BatchStatus.OPEN, "Invalid batch status");
        batches[batchId].status = BatchStatus.CLOSED;
        emit BatchClosed(batchId);
    }

    function getDonation(uint256 batchId, uint256 index) external view returns (Donation memory) {
        return batches[batchId].donations[index];
    }
}