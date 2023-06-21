// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ITribeDapp is IERC1155 {

    event EditTribe(uint256 id);
}
