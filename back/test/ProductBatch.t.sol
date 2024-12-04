// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ProductBatch.sol";

contract ProductBatchTest is Test {
    ProductBatch public productBatch;
    address admin = address(1);
    address donor = address(2);
    address transporter = address(3);
    string latitude = "40.416775";
    string longitude = "-3.703790";

    function setUp() public {
        vm.startPrank(address(this));
        productBatch = new ProductBatch();

        // Add members      
        productBatch.addMember("user_admin", admin, IDataTypes.Role.ADMIN);
        productBatch.addMember("user_donor", donor, IDataTypes.Role.DONOR);
        productBatch.addMember("user_transporter", transporter, IDataTypes.Role.TRANSPORTER);
        vm.stopPrank();
    }

    function testBatchCreation() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);

        // Verify batch creation
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.id, 1);
        assertEq(batch.locations[0].latitude, latitude);
        assertEq(batch.locations[0].longitude, longitude);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.OPEN));
        assertEq(batch.currentHandler, admin);
        vm.stopPrank();
    }

    function testAddMultipleDonations() public {
        // First create a batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // Then add donations
        vm.startPrank(donor);
        uint256 donationId1 = productBatch.createDonation(
            "Donation test 1",
            IDataTypes.DonationType.Food,
            "image_url_1"
        );
        uint256 donationId2 = productBatch.createDonation(
            "Donation test 2",
            IDataTypes.DonationType.Food,
            "image_url_2"
        );
        vm.stopPrank();

        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId1);
        productBatch.addDonationToBatch(1, donationId2);
        vm.stopPrank();

        // Verify that donations were created
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations[0].description, "Donation test 1");
        assertEq(batch.donations[1].description, "Donation test 2");
        assertEq(batch.donations[0].donor, donor);
        assertEq(batch.donations[1].donor, donor);
    }

    function testBatchClosing() public {
        vm.startPrank(admin);
        productBatch.closeBatch(1);
        vm.stopPrank();
    }

    function testBatchClaimForTransporter() public {
        // First create and close a batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Then the transporter claims it
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        // Verify that the batch was claimed
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, transporter);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.IN_TRANSIT));
    }

    function testBatchClaimForDelivery() public {
        // First create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        // Now the admin can claim it for delivery
        vm.startPrank(admin);
        productBatch.claimBatchForDelivery(1);
        vm.stopPrank();

        // Verifications
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, admin);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.DELIVERY));
    }

    function testLocationUpdate() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        
        // Update location
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.updateLocation(1, newLatitude, newLongitude);
        vm.stopPrank();

        // Verify that location was updated
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.locations[1].latitude, newLatitude);
        assertEq(batch.locations[1].longitude, newLongitude);
    }

    function testDonationAddition() public {
        vm.startPrank(donor);
        uint256 donationId = productBatch.createDonation(
            "Donation test",
            IDataTypes.DonationType.Food,
            "image_url"
        );
        vm.stopPrank();

        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId);
        vm.stopPrank();

        // Verify that donation was added
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations[0].description, "Donation test");
        assertEq(batch.donations[0].donor, donor);
    }

    function testOpenBatchCloseBatchClaimUpdateLocationTransferBatch() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Transporter claims the batch and updates location
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.updateLocation(1, newLatitude, newLongitude);

        string memory destinationLatitude = "40.416775";
        string memory destinationLongitude = "-3.703790";
        productBatch.transferBatch(1, address(4), destinationLatitude, destinationLongitude);
        vm.stopPrank();

        // Verify that batch was transferred
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, address(4));
        // Validate all locations
        assertEq(batch.locations[0].latitude, latitude);
        assertEq(batch.locations[0].longitude, longitude);
        assertEq(batch.locations[1].latitude, newLatitude);
        assertEq(batch.locations[1].longitude, newLongitude);
        assertEq(batch.locations[2].latitude, destinationLatitude);
        assertEq(batch.locations[2].longitude, destinationLongitude);
    }

    function testAllDonations() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // Add donations
        vm.startPrank(donor);
        uint256 donationId1 = productBatch.createDonation(
            "Donation 1",
            IDataTypes.DonationType.Food,
            "image_url_1"
        );
        uint256 donationId2 = productBatch.createDonation(
            "Donation 2",
            IDataTypes.DonationType.Food,
            "image_url_2"
        );
        vm.stopPrank();

        // Get all donations as admin
        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId1);
        productBatch.addDonationToBatch(1, donationId2);
        IDataTypes.Donation[] memory donations = productBatch.getAllDonationsInAllBatches();
        vm.stopPrank();

        assertEq(donations.length, 2);
    }

    function testGetAllListOfMembers() public {
        // Verify that the members were added Admin, Donor and Transporter and owner
        vm.startPrank(admin);
        IDataTypes.Members[] memory initialMembers = productBatch.getAllListOfMembers();
        vm.stopPrank();
        assertEq(initialMembers.length, 4);

        // Add 2 more members
        vm.startPrank(admin);
        productBatch.addMember("user_donor2", address(5), IDataTypes.Role.DONOR);
        productBatch.addMember("user_donor3", address(6), IDataTypes.Role.DONOR);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Members[] memory members = productBatch.getAllListOfMembers();
        vm.stopPrank();

        assertEq(members.length, 6);
    }

    function testAddMemberUnauthorized() public {
        vm.startPrank(donor);
        vm.expectRevert("Unauthorized");
        productBatch.addMember("unauthorized", address(7), IDataTypes.Role.DONOR);
        vm.stopPrank();
    }

    function testGetAllBatches() public {
        // Create and close the batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.createBatch(newLatitude, newLongitude);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatches();
        vm.stopPrank();

        assertEq(batches.length, 2);
    }

    function testAddDonationToBatchExceedingLimit() public {
        // Create batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // Create 6 donations (exceeding the 5 limit)
        vm.startPrank(donor);
        uint256[] memory donationIds = new uint256[](6);
        for(uint i = 0; i < 6; i++) {
            donationIds[i] = productBatch.createDonation(
                string(abi.encodePacked("Donation ", i)),
                IDataTypes.DonationType.Food,
                string(abi.encodePacked("image_url_", i))
            );
        }
        vm.stopPrank();

        // Try to add all donations
        vm.startPrank(admin);
        // Add first 5 donations (should succeed)
        for(uint i = 0; i < 5; i++) {
            productBatch.addDonationToBatch(1, donationIds[i]);
        }
        // The 6th donation should fail
        vm.expectRevert("Batch is full");
        productBatch.addDonationToBatch(1, donationIds[5]);
        vm.stopPrank();
    }

    function testGetAllBatchesWithStatusClosedReadyForTransporter() public {
        // Create batch add donations and claim for transporter
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.createBatch(newLatitude, newLongitude);
        productBatch.closeBatch(2);
        string memory newLatitude2 = "40.416775";
        string memory newLongitude2 = "-3.703790";
        productBatch.createBatch(newLatitude2, newLongitude2);
        productBatch.closeBatch(3);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(3);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesWithStatusClosedReadyForTransporter();
        vm.stopPrank();

        assertEq(batches.length, 2);
    }

    function testGetAllBatchesWithStatusInTransitReadyForDelivery() public {
        // Create batch add donations and claim for transporter
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesWithStatusInTransitReadyForDeliveryIn();
        vm.stopPrank();

        assertEq(batches.length, 1);
    }

    function testAddDonationToClosedBatch() public {
        // Create and close batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Create donation
        vm.startPrank(donor);
        uint256 donationId = productBatch.createDonation(
            "Test Donation",
            IDataTypes.DonationType.Food,
            "image_url"
        );
        vm.stopPrank();

        // Try to add donation to closed batch
        vm.startPrank(admin);
        vm.expectRevert("Batch not open");
        productBatch.addDonationToBatch(1, donationId);
        vm.stopPrank();
    }

    function testClaimBatchForTransporterNotClosed() public {
        // Create batch but don't close it
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // Try to claim as transporter
        vm.startPrank(transporter);
        vm.expectRevert("Batch not ready");
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();
    }

    function testClaimBatchForDeliveryNotInTransit() public {
        // Create batch but don't put it in transit
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.expectRevert("Batch not in transit");
        productBatch.claimBatchForDelivery(1);
        vm.stopPrank();
    }

    function testUpdateLocationNotHandler() public {
        // Create and close batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Let transporter claim it
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        // Try to update location as donor (not handler)
        vm.startPrank(donor);
        vm.expectRevert("Not handler");
        productBatch.updateLocation(1, "40.416775", "-3.703790");
        vm.stopPrank();
    }

    function testTransferBatchNotHandler() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        address newTransporter = address(7);
        vm.startPrank(donor);
        vm.expectRevert("Unauthorized");
        productBatch.transferBatch(1, newTransporter, "40.416775", "-3.703790");
        vm.stopPrank();
    }

    function testTransferBatchNotInTransit() public {
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        vm.startPrank(transporter);
        vm.expectRevert("Not the current handler");
        productBatch.transferBatch(1, address(7), "40.416775", "-3.703790");
        vm.stopPrank();
    }

    function testGetEmptyBatches() public {
        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatches();
        assertEq(batches.length, 0);
        vm.stopPrank();
    }

    function testGetEmptyDonations() public {
        vm.startPrank(admin);
        IDataTypes.Donation[] memory donations = productBatch.getAllDonationsInAllBatches();
        assertEq(donations.length, 0);
        vm.stopPrank();
    }

    function testCompleteFlow() public {
        // 1. Create batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        // 2. Add donations
        vm.startPrank(donor);
        uint256 donationId1 = productBatch.createDonation(
            "Donation 1",
            IDataTypes.DonationType.Food,
            "image_url_1"
        );
        uint256 donationId2 = productBatch.createDonation(
            "Donation 2",
            IDataTypes.DonationType.CleaningSupplies,
            "image_url_2"
        );
        vm.stopPrank();

        // 3. Admin adds donations to batch and closes it
        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId1);
        productBatch.addDonationToBatch(1, donationId2);
        productBatch.closeBatch(1);
        vm.stopPrank();

        // 4. Transporter claims and updates location
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        productBatch.updateLocation(1, "41.416775", "-4.703790");
        vm.stopPrank();

        // 5. Admin claims for delivery
        vm.startPrank(admin);
        productBatch.claimBatchForDelivery(1);
        vm.stopPrank();

        // Verify final state
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations.length, 2);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.DELIVERY));
        assertEq(batch.currentHandler, admin);
        assertEq(batch.locations.length, 2);
    }

    function testGetDonation() public {
        // Create batch and add donation
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        vm.startPrank(donor);
        uint256 donationId = productBatch.createDonation(
            "Test Donation",
            IDataTypes.DonationType.Food,
            "image_url"
        );
        vm.stopPrank();

        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId);
        
        // Get and verify donation
        IDataTypes.Donation memory donation = productBatch.getDonation(1, 0);
        assertEq(donation.description, "Test Donation");
        assertEq(donation.donor, donor);
        assertEq(uint(donation.donationType), uint(IDataTypes.DonationType.Food));
        assertEq(donation.imageUrl, "image_url");
        vm.stopPrank();
    }

    function testGetAllBatchesWithStatusDeliveryReadyForDeliveryOut() public {
        // Create batch and move it to DELIVERY status
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        vm.stopPrank();

        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();

        vm.startPrank(admin);
        productBatch.claimBatchForDelivery(1);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesWithStatusDeliveryReadyForDeliveryOut();
        vm.stopPrank();

        assertEq(batches.length, 1);
    }

    function testGetAllDonationsAsAdmin() public {
        // Create donations
        vm.startPrank(donor);
        productBatch.createDonation(
            "Donation 1",
            IDataTypes.DonationType.Food,
            "image_url_1"
        );
        productBatch.createDonation(
            "Donation 2",
            IDataTypes.DonationType.CleaningSupplies,
            "image_url_2"
        );
        vm.stopPrank();

        // Get all donations as admin
        vm.startPrank(admin);
        IDataTypes.Donation[] memory donations = productBatch.getAllDonations();
        vm.stopPrank();

        assertEq(donations.length, 2);
    }

    function testGetAllDonationsAsDonor() public {
        // Create donations
        vm.startPrank(donor);
        productBatch.createDonation(
            "Donation 1",
            IDataTypes.DonationType.Food,
            "image_url_1"
        );
        IDataTypes.Donation[] memory donations = productBatch.getAllDonations();
        assertEq(donations.length, 1);
        vm.stopPrank();
    }

    function testGetAllDonationsUnauthorized() public {
        vm.startPrank(transporter);
        vm.expectRevert("Only admin or donor can access");
        productBatch.getAllDonations();
        vm.stopPrank();
    }

    function testUpdateLocationNotInTransit() public {
        // Create batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        vm.startPrank(transporter);
        vm.expectRevert("Not handler");
        productBatch.updateLocation(1, "40.416775", "-3.703790");
        vm.stopPrank();
    }

    function testAddDonationToBatchNonexistentDonation() public {
        // Create batch
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.expectRevert("Donation does not exist");
        productBatch.addDonationToBatch(1, 999);
        vm.stopPrank();
    }

    function testAddDonationToBatchAlreadyAssigned() public {
        // Create batch and donation
        vm.startPrank(admin);
        productBatch.createBatch(latitude, longitude);
        vm.stopPrank();

        vm.startPrank(donor);
        uint256 donationId = productBatch.createDonation(
            "Test Donation",
            IDataTypes.DonationType.Food,
            "image_url"
        );
        vm.stopPrank();

        // Add donation to batch
        vm.startPrank(admin);
        productBatch.addDonationToBatch(1, donationId);
        
        // Try to add same donation again
        vm.expectRevert("Donation already assigned");
        productBatch.addDonationToBatch(1, donationId);
        vm.stopPrank();
    }

    function testGetAllBatchesInTransitAndDelivery() public {
        // Create multiple batches and move them to different states
        vm.startPrank(admin);
        // First batch - will be in DELIVERY
        productBatch.createBatch(latitude, longitude);
        productBatch.closeBatch(1);
        
        // Second batch - will be in IN_TRANSIT
        string memory newLatitude = "36.721357";
        string memory newLongitude = "-0.800341";
        productBatch.createBatch(newLatitude, newLongitude);
        productBatch.closeBatch(2);
        
        // Third batch - will remain in OPEN state
        string memory newLatitude2 = "41.416775";
        string memory newLongitude2 = "-4.703790";
        productBatch.createBatch(newLatitude2, newLongitude2);
        vm.stopPrank();

        // Move first batch to DELIVERY
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(1);
        vm.stopPrank();
        
        vm.startPrank(admin);
        productBatch.claimBatchForDelivery(1);
        vm.stopPrank();

        // Move second batch to IN_TRANSIT
        vm.startPrank(transporter);
        productBatch.claimBatchForTransporter(2);
        vm.stopPrank();

        // Get all batches in transit and delivery
        vm.startPrank(admin);
        IDataTypes.Batch[] memory batches = productBatch.getAllBatchesInTransitAndDelivery();
        vm.stopPrank();

        // Verify results
        assertEq(batches.length, 2);
        assertEq(uint(batches[0].status), uint(IDataTypes.BatchStatus.DELIVERY));
        assertEq(uint(batches[1].status), uint(IDataTypes.BatchStatus.IN_TRANSIT));
    }
}
