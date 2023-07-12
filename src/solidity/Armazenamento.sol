//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct CNH {
    string nome;
    uint256 registro;
    uint256 validade; // Especificado em tempo Unix Epoch
}

contract Armazenamento {

    mapping(string => string) public pessoas;
    mapping(string => uint256) public registros;

    function getNome(string memory _nome) public view returns (string memory) {
        return pessoas[_nome];
    }

    function getNumero(string memory _nome) public view returns (uint256) {
        return registros[_nome];
    }

    function addPessoa(string memory _nome, uint256 _numero) public {
        pessoas[_nome] = _nome;
        registros[_nome] = _numero; 
    }
}