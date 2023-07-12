//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct CNH {
    string nome;
    uint256 registro;
    uint256 validade; // Especificado em tempo Unix Epoch
}

contract Armazenamento {

    mapping(string => string) public pessoas;
    address dono;

    constructor() { //Ao ser criado, o contrato armazena o endereco do realizador do contrato
        dono = msg.sender;
    }

    modifier onlyDono { 
        require(msg.sender == dono);
        _;
    }

    function addPessoa(string memory _nome, uint256 _numero) public {
        pessoas[_nome] = _nome;
        registros[_nome] = _numero; 
    }
}