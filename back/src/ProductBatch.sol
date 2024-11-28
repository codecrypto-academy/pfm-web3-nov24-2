// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./IDataTypes.sol";

contract ProductBatch is ERC1155, IDataTypes {
    uint256 private constant MAX_PRODUCTS_PER_BATCH = 5;
    uint256 private currentBatchId = 1;
    uint256 private currentMemberId = 0;
    
    mapping(address => Members) private members;
    mapping(uint256 => Members) private listOfMembers;
    mapping(uint256 => Batch) private batches;

    constructor() ERC1155("https://token-cdn-domain/{id}.json") {
        members[msg.sender] = Members(msg.sender, Role.ADMIN, true);
        listOfMembers[currentMemberId] = members[msg.sender];
        currentMemberId++;
    }
    
    modifier onlyRole(Role role) {
        require(members[msg.sender].role == role, "Unauthorized");
        require(members[msg.sender].isActive, "Account inactive");
        _;
    }

    function addMember(address account, Role role) external onlyRole(Role.ADMIN) {
        members[account] = Members(account, role, true);
        listOfMembers[currentMemberId] = members[account];
        currentMemberId++;
    }

    function getAllListOfMembers() external view returns (Members[] memory) {
        Members[] memory allMembers = new Members[](currentMemberId);
        for (uint256 i = 0; i < currentMemberId; i++) {
            if (listOfMembers[i].isActive) {
                allMembers[i] = listOfMembers[i];
            }
        }
        return allMembers;
    }

    function createBatch(string memory latitude, string memory longitude) external onlyRole(Role.ADMIN) {
        _mint(msg.sender, currentBatchId, 1, "");
        
        Batch storage newBatch = batches[currentBatchId];
        newBatch.id = currentBatchId;
        newBatch.status = BatchStatus.OPEN;
        newBatch.currentHandler = msg.sender;
        newBatch.locations.push(Location({
            latitude: latitude,
            longitude: longitude
        }));
        
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
                timestamp: block.timestamp
            })
        );
        emit ProductAdded(batchId, batches[batchId].donations.length - 1, msg.sender);
    }

    function claimBatchForTransporter(uint256 batchId) external onlyRole(Role.TRANSPORTER) {
        require(batches[batchId].status == BatchStatus.CLOSED, "Batch not ready");
        
        batches[batchId].currentHandler = msg.sender;
        batches[batchId].status = BatchStatus.IN_TRANSIT;

        emit BatchClaimed(batchId, BatchStatus.IN_TRANSIT);
    }

    function claimBatchForDelivery(uint256 batchId) external onlyRole(Role.ADMIN) {
        require(batches[batchId].status == BatchStatus.IN_TRANSIT, "Batch not in transit");
        batches[batchId].currentHandler = msg.sender;
        batches[batchId].status = BatchStatus.DELIVERY;

        emit BatchClaimed(batchId, BatchStatus.DELIVERY);
    }

    function updateLocation(uint256 batchId, string memory latitude, string memory longitude) external {
        require(batches[batchId].currentHandler == msg.sender, "Not handler");
        require(batches[batchId].status == BatchStatus.IN_TRANSIT, "Not in transit");
        
        batches[batchId].locations.push(Location({
            latitude: latitude,
            longitude: longitude
        }));
        emit LocationUpdated(batchId, latitude, longitude);
    }

    function getDonation(uint256 batchId, uint256 index) external view returns (Donation memory) {
        return batches[batchId].donations[index];
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return batches[batchId];
    }

    function transferBatch(uint256 batchId, address newHandler, string memory latitude, string memory longitude) public onlyRole(IDataTypes.Role.TRANSPORTER) {
        require(batches[batchId].currentHandler == msg.sender, "Not the current handler");
        require(batches[batchId].status == IDataTypes.BatchStatus.IN_TRANSIT, "Batch not in transit");
        
        batches[batchId].currentHandler = newHandler;
        batches[batchId].locations.push(Location({  
            latitude: latitude,
            longitude: longitude
        }));
        emit BatchTransferred(batchId, newHandler, latitude, longitude);
    }

    function getAllDonationsInAllBatches() external view returns (Donation[] memory) {
        // First, count total donations
        uint256 totalDonations = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            totalDonations += batches[i].donations.length;
        }
        
        // Create array with correct size and populate it
        Donation[] memory allDonations = new Donation[](totalDonations);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            for (uint256 j = 0; j < batches[i].donations.length; j++) {
                allDonations[currentIndex] = batches[i].donations[j];
                currentIndex++;
            }
        }
        return allDonations;
    }

    function getAllBatches() external view returns (Batch[] memory) {
        Batch[] memory allBatches = new Batch[](currentBatchId - 1);
        for (uint256 i = 1; i < currentBatchId; i++) {
            allBatches[i - 1] = batches[i];
        }
        return allBatches;
    }

    function getAllBatchesWithStatusClosedReadyForTransporter() external view returns (Batch[] memory) {
        // First, count how many batches have CLOSED status
        uint256 count = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            if (batches[i].status == BatchStatus.CLOSED) {
                count++;
            }
        }

        // Create array with exact size needed
        Batch[] memory closedBatches = new Batch[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            if (batches[i].status == BatchStatus.CLOSED) {
                closedBatches[currentIndex] = batches[i];
                currentIndex++;
            }
        }
        return closedBatches;
    }

    function getAllBatchesWithStatusInTransitReadyForDelivery () external view returns (Batch[] memory) {
        // First, count how many batches have IN_TRANSIT status
        uint256 count = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            if (batches[i].status == BatchStatus.IN_TRANSIT) {
                count++;
            }
        }

        // Create array with exact size needed
        Batch[] memory inTransitBatches = new Batch[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i < currentBatchId; i++) {
            if (batches[i].status == BatchStatus.IN_TRANSIT) {
                inTransitBatches[currentIndex] = batches[i];
                currentIndex++;
            }
        }
        return inTransitBatches;
    }
}
