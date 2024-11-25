// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./IDataTypes.sol";

contract ProductBatch is ERC1155, IDataTypes {
    uint256 private constant MAX_PRODUCTS_PER_BATCH = 5;
    uint256 private currentBatchId = 1;
    
    mapping(address => Members) private members;
    mapping(uint256 => Batch) private batches;

    constructor() ERC1155("https://token-cdn-domain/{id}.json") {
        members[msg.sender] = Members(msg.sender, Role.ADMIN, true);
    }
    
    modifier onlyRole(Role role) {
        require(members[msg.sender].role == role, "Unauthorized");
        require(members[msg.sender].isActive, "Account inactive");
        _;
    }

    function addMember(address account, Role role) external onlyRole(Role.ADMIN) {
        members[account] = Members(account, role, true);
    }

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

    function addDonation(uint256 batchId, string memory productDescription) external onlyRole(Role.DONOR) {
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

    function getDonation(uint256 batchId, uint256 index) external view returns (Donation memory) {
        return batches[batchId].donations[index];
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return batches[batchId];
    }

    function transferBatch(uint256 batchId, address newHandler, string memory newLocation) public onlyRole(IDataTypes.Role.TRANSPORTER) {
        require(batches[batchId].currentHandler == msg.sender, "Not the current handler");
        require(batches[batchId].status == IDataTypes.BatchStatus.IN_TRANSIT, "Batch not in transit");
        
        batches[batchId].currentHandler = newHandler;
        batches[batchId].locations.push(newLocation);
        emit BatchTransferred(batchId, newHandler, newLocation);
    }
}