## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

---
1. Levantar la blockchain local con Anvil
Inicia Anvil (la red local proporcionada por Foundry):

```bash
anvil
```

- Por defecto:
  La red estará disponible en http://127.0.0.1:8545.

  Se generarán cuentas prefundidas con 10,000 ETH ficticios.

  Copia una de las claves privadas mostradas en la consola, ya que se usará para desplegar el contrato.


2. Desplegar el contrato en la red local
2.1 Crear el script de despliegue
Crea un script en script/Deploy.s.sol:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Contract.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();
        
        // Desplegar el contrato
        MyContract contractInstance = new MyContract("Hello, Foundry!");
        console.log("Contrato desplegado en:", address(contractInstance));
        
        vm.stopBroadcast();
    }
}
```

2.2 Desplegar el contrato
    Ejecuta el script de despliegue:

```bash
export PRIVATE_KEY="0xYourPrivateKey"
forge script script/Deploy.s.sol --broadcast --rpc-url http://127.0.0.1:8545
```

Esto hará lo siguiente:

- Conectará al nodo de Anvil.

- Usará una de las cuentas prefundidas para desplegar el contrato.

- Mostrará la dirección del contrato desplegado.

3. Conectar MetaMask a Anvil

    3.1 Abre MetaMask.

    3.2 Conecta MetaMask a la red Anvil:
      - RPC URL: http://127.0.0.1:8545
      - Chain ID: 31337

    3.3 Importa una cuenta prefundida:
      - Usa una de las claves privadas generadas por Anvil.