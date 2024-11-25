// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ProductBatch.sol";

contract ProductBatchTest is Test {
    ProductBatch public productBatch;
    address admin = address(1);
    address donor = address(2);
    address transporter = address(3);

    function setUp() public {
        vm.startPrank(address(this));
        productBatch = new ProductBatch();

        // Add members
        productBatch.addMember(admin, IDataTypes.Role.ADMIN);
        productBatch.addMember(donor, IDataTypes.Role.DONOR);
        productBatch.addMember(transporter, IDataTypes.Role.TRANSPORTER);
        vm.stopPrank();
    }

    function testBatchCreation() public {
        vm.startPrank(admin);
        productBatch.createBatch("Palma");

        // Verify batch creation
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.id, 1);
        assertEq(batch.locations[0], "Palma");
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.OPEN));
        assertEq(batch.currentHandler, admin);
        vm.stopPrank();
    }

    function testAddMultipleDonations() public {
        vm.startPrank(donor);
        productBatch.addDonation(1, "Donation test 1");
        productBatch.addDonation(1, "Donation test 2");
        vm.stopPrank();

        // Verificamos que las donaciones fueron añadidas
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

    function testBatchClaim() public {
        // Primero creamos y cerramos un batch
        vm.startPrank(admin);
        productBatch.createBatch("Palma");
        productBatch.closeBatch(1);
        vm.stopPrank();

        // Luego el transportista lo reclama
        vm.startPrank(transporter);
        productBatch.claimBatch(1);
        vm.stopPrank();

        // Verificamos que el batch fue reclamado
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, transporter);
        assertEq(uint(batch.status), uint(IDataTypes.BatchStatus.IN_TRANSIT));
    }

    function testLocationUpdate() public {
        // Crear y cerrar el batch
        vm.startPrank(admin);
        productBatch.createBatch("Palma");
        productBatch.closeBatch(1);
        vm.stopPrank();

        // El transportista reclama el batch
        vm.startPrank(transporter);
        productBatch.claimBatch(1);
        
        // Actualiza la ubicación
        productBatch.updateLocation(1, "Alicante");
        vm.stopPrank();

        // Verificamos que la ubicación fue actualizada
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.locations[1], "Alicante");
    }

    function testDonationAddition() public {
        vm.startPrank(donor);
        productBatch.addDonation(1, "Donation test");
        vm.stopPrank();

        // Verificamos que la donación fue añadida
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.donations[0].description, "Donation test");
        assertEq(batch.donations[0].donor, donor);
    }

    function testOpenBatchCloseBatchClaimUpdateLocationTransferBatch() public {
        // Crear y cerrar el batch
        vm.startPrank(admin);
        productBatch.createBatch("Palma");
        productBatch.closeBatch(1);
        vm.stopPrank();

        // El transportista reclama el batch y actualiza ubicación
        vm.startPrank(transporter);
        productBatch.claimBatch(1);
        productBatch.updateLocation(1, "Madrid");
        productBatch.transferBatch(1, address(4), "Valencia");
        vm.stopPrank();

        // Verificamos que el batch fue transferido
        IDataTypes.Batch memory batch = productBatch.getBatch(1);
        assertEq(batch.currentHandler, address(4));
        // validamos todas las localizaciones
        assertEq(batch.locations[0], "Palma");
        assertEq(batch.locations[1], "Madrid");
        assertEq(batch.locations[2], "Valencia");
    }
}