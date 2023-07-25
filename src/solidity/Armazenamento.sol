//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct CNH {
    string nome;
    uint256 registro;
    uint256 validade; // Especificado em tempo Unix Epoch
}

contract Armazenamento {

    CNH[] public CNHS; // Array dinamico
    address dono;

    constructor() { //Ao ser criado, o contrato armazena o endereco do realizador do contrato
        dono = msg.sender;
    }

    modifier onlyDono { 
        require(msg.sender == dono);
        _;
    }

    function getCNHlength() public view onlyDono returns (uint256) {
        return CNHS.length;
    }

    function addCNH(string memory _nome, uint256 _registro, uint256 _validade) public onlyDono {
        CNHS.push(CNH(_nome, _registro, _validade)); 
    }

    function alterarNome(uint256 _index, string memory _nome) onlyDono() public {
        CNHS[_index].nome = _nome;
    }

    function alterarValidade(uint256 _index, uint256 _validade) onlyDono() public {
        CNHS[_index].validade = _validade;
    }
}
