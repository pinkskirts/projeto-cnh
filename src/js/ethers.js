const { ethers } = require("ethers"); //5.4.0
//const CHAVE_PRIVADA = require("./env")
//const RPC_URL = require("./env")
//const fs = require("fs");
//const addPessoaDB = require('./mongoCluster')

window.onload = () => {
  //const CHAVE_PRIVADA = process.env.PRIVATE_KEY;
  //const RPC_URL = process.env.RPC_URL;
  
  const CHAVE_PRIVADA =
    "0b252161d411f4dce27b3dbb1c3eb35c54aa0bd8361cb3af046280730105a9c2";
  const RPC_URL = "http://127.0.0.1:7545";

  /*
  const abi = fs.readFileSync(
    "../solidity/Armazenamento_sol_Armazenamento.abi",
    "utf8"
  );
  const binario = fs.readFileSync(
    "../solidity/Armazenamento_sol_Armazenamento.bin",
    "utf8"
  );
  */

  //Conectar
  const conectarMeta = document.getElementById("conectar");
  const contaConectada = document.getElementById("contaConectada");
  const contratoText = document.getElementById("contratoText");

  //Registrar
  const nome = document.getElementById("nome");
  const registro = document.getElementById("registro");
  const registrar = document.getElementById("registrar");

  //Consultar
  const inputConsulta = document.getElementById("inputConsulta");
  const resultadoTexto = document.getElementById("resultadoTexto");
  const registroConsulta = document.getElementById("registroConsulta");
  const botaoConsultar = document.getElementById("consultar");
  const botaoLimpar = document.getElementById("limpar");

  //Outros
  const botaoDebug = document.getElementById("debug");

  //Demais variáveis
  var contrato = null;
  var enderecoContrato;
  var conta = null;
  var signer;
  var provedor;

  //Atribuição das funções aos botões
  conectarMeta.onclick = conectar;
  registrar.onclick = adicionarPessoa;
  botaoConsultar.onclick = consultar;
  botaoLimpar.onclick = limpar;
  botaoDebug.onclick = debug;

  async function conectar() {
    if (typeof window.ethereum !== undefined && conta === null) {
      conta = await window.ethereum.request({ method: "eth_requestAccounts" });
      contaConectada.innerHTML = `Conta conectada: ${conta}`;
      await acionarContrato();
      conectarMeta.innerHTML = "Conectado!";
    } else {
      alert("Conexão já estabelecida!");
    }
  }

  async function acionarContrato() {
    provedor = new ethers.providers.JsonRpcProvider(RPC_URL);
    const carteira = new ethers.Wallet(CHAVE_PRIVADA, provedor);
    const contractFactory = new ethers.ContractFactory(abi, binario, carteira);
    contrato = await contractFactory.deploy(); // Gera o initcode do contrato

    enderecoContrato = contrato.address;
    contratoText.innerText = `Endereço do contrato: ${enderecoContrato}`;
  }

  async function adicionarPessoa() {
    if (typeof window.ethereum != undefined) {
      provedor = new ethers.providers.Web3Provider(window.ethereum); // Provedor = Metamask
      signer = provedor.getSigner(); // Retorna a carteira (wallet) assinante da transacao, atrelada ao provedor (Metamask)
      contrato = new ethers.Contract(enderecoContrato, abi, signer); // Atualizacao do contrato
      try {
        console.log("Nome inserido:", nome.value); // debug
        console.log("Registro inserido:", registro.value); // debug
        const transactionResponse = await contrato.addPessoa(
          nome.value,
          registro.value
        );
        await listenForTransactionMine(transactionResponse, provedor);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function consultar() {
    if (typeof window.ethereum != undefined) {
      try {
        const registroArmazenado = await contrato.getNumero(
          inputConsulta.value
        );
        console.log("Input:", inputConsulta.value.toString());
        console.log(
          "Registro associado ao input:",
          registroArmazenado.toString()
        ); // debug
        resultadoTexto.innerText = "Resultado:";
        registroConsulta.innerText =
          "Registro --> " + registroArmazenado.toString();
      } catch (error) {
        console.log(error);
      }
    }
  }

  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Hash da transação: ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completa com ${transactionReceipt.confirmations} confirmação.`
        );
        resolve();
      });
    });
  }

  function debug() {
    if (typeof window.ethereum == undefined || contrato === null) {
      alert("Inicialize o contrato primeiro!");
    } else {
      console.log("Endereço do contrato: ", contrato.address); //debug
      console.log(contrato.deployTransaction);
      console.log(contrato.interface);
      console.log(contrato.provider);
      console.log(contrato.signer);
      console.log(conta);
    }
  }

  function limpar() {
    resultadoTexto.innerHTML = "";
    registroConsulta.innerHTML = "";
  }
  
  const abi = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "CNHS",
      outputs: [
        {
          internalType: "string",
          name: "nome",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "registro",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "validade",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_nome",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_registro",
          type: "uint256",
        },
      ],
      name: "addCNH",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256",
    },
    {
          internalType: "string",
          name: "_novonome",
          type: "string",
        },
      ],
      name: "alterarNome",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "alterarValidade",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCNHlength",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const binario =
    "608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610965806100616000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80635d9e5ff51461005c57806389a2f6011461008e578063c481732d14610098578063cccf67c4146100b4578063f372379b146100d0575b600080fd5b61007660048036038101906100719190610310565b6100ee565b604051610085939291906103dc565b60405180910390f35b6100966101b0565b005b6100b260048036038101906100ad919061054f565b6101b2565b005b6100ce60048036038101906100c991906105ab565b610283565b005b6100d86102ba565b6040516100e59190610607565b60405180910390f35b600081815481106100fe57600080fd5b906000526020600020906003020160009150905080600001805461012190610651565b80601f016020809104026020016040519081016040528092919081815260200182805461014d90610651565b801561019a5780601f1061016f5761010080835404028352916020019161019a565b820191906000526020600020905b81548152906001019060200180831161017d57829003601f168201915b5050505050908060010154908060020154905083565b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461020c57600080fd5b60006040518060600160405280848152602001838152602001600081525090806001815401808255809150506001900390600052602060002090600302016000909190919091506000820151816000019081610268919061082e565b50602082015181600101556040820151816002015550505050565b806000838154811061029857610297610900565b5b906000526020600020906003020160000190816102b5919061082e565b505050565b60008080549050905090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6102ed816102da565b81146102f857600080fd5b50565b60008135905061030a816102e4565b92915050565b600060208284031215610326576103256102d0565b5b6000610334848285016102fb565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561037757808201518184015260208101905061035c565b60008484015250505050565b6000601f19601f8301169050919050565b600061039f8261033d565b6103a98185610348565b93506103b9818560208601610359565b6103c281610383565b840191505092915050565b6103d6816102da565b82525050565b600060608201905081810360008301526103f68186610394565b905061040560208301856103cd565b61041260408301846103cd565b949350505050565b600080fd5b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61045c82610383565b810181811067ffffffffffffffff8211171561047b5761047a610424565b5b80604052505050565b600061048e6102c6565b905061049a8282610453565b919050565b600067ffffffffffffffff8211156104ba576104b9610424565b5b6104c382610383565b9050602081019050919050565b82818337600083830152505050565b60006104f26104ed8461049f565b610484565b90508281526020810184848401111561050e5761050d61041f565b5b6105198482856104d0565b509392505050565b600082601f8301126105365761053561041a565b5b81356105468482602086016104df565b91505092915050565b60008060408385031215610566576105656102d0565b5b600083013567ffffffffffffffff811115610584576105836102d5565b5b61059085828601610521565b92505060206105a1858286016102fb565b9150509250929050565b600080604083850312156105c2576105c16102d0565b5b60006105d0858286016102fb565b925050602083013567ffffffffffffffff8111156105f1576105f06102d5565b5b6105fd85828601610521565b9150509250929050565b600060208201905061061c60008301846103cd565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061066957607f821691505b60208210810361067c5761067b610622565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026106e47fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826106a7565b6106ee86836106a7565b95508019841693508086168417925050509392505050565b6000819050919050565b600061072b610726610721846102da565b610706565b6102da565b9050919050565b6000819050919050565b61074583610710565b61075961075182610732565b8484546106b4565b825550505050565b600090565b61076e610761565b61077981848461073c565b505050565b5b8181101561079d57610792600082610766565b60018101905061077f565b5050565b601f8211156107e2576107b381610682565b6107bc84610697565b810160208510156107cb578190505b6107df6107d785610697565b83018261077e565b50505b505050565b600082821c905092915050565b6000610805600019846008026107e7565b1980831691505092915050565b600061081e83836107f4565b9150826002028217905092915050565b6108378261033d565b67ffffffffffffffff8111156108505761084f610424565b5b61085a8254610651565b6108658282856107a1565b600060209050601f8311600181146108985760008415610886578287015190505b6108908582610812565b8655506108f8565b601f1984166108a686610682565b60005b828110156108ce578489015182556001820191506020850194506020810190506108a9565b868310156108eb57848901516108e7601f8916826107f4565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea264697066735822122086d2aaa77c628d0815b7df7c0115cfb4ddaa153e3a61f476668cea463374692264736f6c63430008120033";
};
