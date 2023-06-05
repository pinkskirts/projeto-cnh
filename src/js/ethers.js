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
  var contas = null;
  var signer;
  var provedor;

  //Atribuição das funções aos botões
  conectarMeta.onclick = conectar;
  registrar.onclick = adicionarPessoa;
  botaoConsultar.onclick = consultar;
  botaoLimpar.onclick = limpar;
  botaoDebug.onclick = debug;

  async function conectar() {
    if (typeof window.ethereum !== undefined && contas === null) {
      contas = await window.ethereum.request({ method: "eth_requestAccounts" });
      contaConectada.innerHTML = `Conta conectada: ${contas}`;
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
    contrato = await contractFactory.deploy();

    enderecoContrato = contrato.address;
    contratoText.innerText = `Endereço do contrato: ${enderecoContrato}`;
  }

  async function adicionarPessoa() {
    if (typeof window.ethereum != undefined) {
      provedor = new ethers.providers.Web3Provider(window.ethereum); //Provedor = Metamask
      signer = provedor.getSigner(); //Retorna a carteira atrelada ao provedor (Metamask)
      contrato = new ethers.Contract(enderecoContrato, abi, signer);
      try {
        console.log("Nome inserido:", nome.value); //debug
        console.log("Registro inserido:", registro.value); //debug
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
      provedor = new ethers.providers.Web3Provider(window.ethereum);
      signer = provedor.getSigner();
      contrato = new ethers.Contract(enderecoContrato, abi, signer);
      try {
        const registroArmazenado = await contrato.getNumero(
          inputConsulta.value
        );
        console.log("Input:", inputConsulta.value.toString());
        console.log(
          "Registro associado ao input:",
          registroArmazenado.toString()
        ); //debug
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
    }
  }

  function limpar() {
    resultadoTexto.innerHTML = "";
    registroConsulta.innerHTML = "";
  }
  
  const abi = [
    {
      inputs: [
        { internalType: "string", name: "_nome", type: "string" },
        { internalType: "uint256", name: "_numero", type: "uint256" },
      ],
      name: "addPessoa",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "_nome", type: "string" }],
      name: "getNome",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "_nome", type: "string" }],
      name: "getNumero",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "", type: "string" }],
      name: "pessoas",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "", type: "string" }],
      name: "registros",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const binario =
    "608060405234801561001057600080fd5b506109ae806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631011d9581461005c578063324f52e21461008c578063595effb0146100bc578063e819bd9e146100ec578063ea5a3f151461011c575b600080fd5b610076600480360381019061007191906104a1565b610138565b6040516100839190610569565b60405180910390f35b6100a660048036038101906100a191906104a1565b6101e8565b6040516100b391906105a4565b60405180910390f35b6100d660048036038101906100d191906104a1565b610216565b6040516100e39190610569565b60405180910390f35b610106600480360381019061010191906104a1565b6102cc565b60405161011391906105a4565b60405180910390f35b610136600480360381019061013191906105eb565b6102f4565b005b606060008260405161014a9190610683565b90815260200160405180910390208054610163906106c9565b80601f016020809104026020016040519081016040528092919081815260200182805461018f906106c9565b80156101dc5780601f106101b1576101008083540402835291602001916101dc565b820191906000526020600020905b8154815290600101906020018083116101bf57829003601f168201915b50505050509050919050565b6001818051602081018201805184825260208301602085012081835280955050505050506000915090505481565b600081805160208101820180518482526020830160208501208183528095505050505050600091509050805461024b906106c9565b80601f0160208091040260200160405190810160405280929190818152602001828054610277906106c9565b80156102c45780601f10610299576101008083540402835291602001916102c4565b820191906000526020600020905b8154815290600101906020018083116102a757829003601f168201915b505050505081565b60006001826040516102de9190610683565b9081526020016040518091039020549050919050565b816000836040516103059190610683565b9081526020016040518091039020908161031f91906108a6565b50806001836040516103319190610683565b9081526020016040518091039020819055505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103ae82610365565b810181811067ffffffffffffffff821117156103cd576103cc610376565b5b80604052505050565b60006103e0610347565b90506103ec82826103a5565b919050565b600067ffffffffffffffff82111561040c5761040b610376565b5b61041582610365565b9050602081019050919050565b82818337600083830152505050565b600061044461043f846103f1565b6103d6565b9050828152602081018484840111156104605761045f610360565b5b61046b848285610422565b509392505050565b600082601f8301126104885761048761035b565b5b8135610498848260208601610431565b91505092915050565b6000602082840312156104b7576104b6610351565b5b600082013567ffffffffffffffff8111156104d5576104d4610356565b5b6104e184828501610473565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610524578082015181840152602081019050610509565b60008484015250505050565b600061053b826104ea565b61054581856104f5565b9350610555818560208601610506565b61055e81610365565b840191505092915050565b600060208201905081810360008301526105838184610530565b905092915050565b6000819050919050565b61059e8161058b565b82525050565b60006020820190506105b96000830184610595565b92915050565b6105c88161058b565b81146105d357600080fd5b50565b6000813590506105e5816105bf565b92915050565b6000806040838503121561060257610601610351565b5b600083013567ffffffffffffffff8111156106205761061f610356565b5b61062c85828601610473565b925050602061063d858286016105d6565b9150509250929050565b600081905092915050565b600061065d826104ea565b6106678185610647565b9350610677818560208601610506565b80840191505092915050565b600061068f8284610652565b915081905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806106e157607f821691505b6020821081036106f4576106f361069a565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830261075c7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261071f565b610766868361071f565b95508019841693508086168417925050509392505050565b6000819050919050565b60006107a361079e6107998461058b565b61077e565b61058b565b9050919050565b6000819050919050565b6107bd83610788565b6107d16107c9826107aa565b84845461072c565b825550505050565b600090565b6107e66107d9565b6107f18184846107b4565b505050565b5b818110156108155761080a6000826107de565b6001810190506107f7565b5050565b601f82111561085a5761082b816106fa565b6108348461070f565b81016020851015610843578190505b61085761084f8561070f565b8301826107f6565b50505b505050565b600082821c905092915050565b600061087d6000198460080261085f565b1980831691505092915050565b6000610896838361086c565b9150826002028217905092915050565b6108af826104ea565b67ffffffffffffffff8111156108c8576108c7610376565b5b6108d282546106c9565b6108dd828285610819565b600060209050601f83116001811461091057600084156108fe578287015190505b610908858261088a565b865550610970565b601f19841661091e866106fa565b60005b8281101561094657848901518255600182019150602085019450602081019050610921565b86831015610963578489015161095f601f89168261086c565b8355505b6001600288020188555050505b50505050505056fea2646970667358221220e79b3b1e03d4bff379bab2588c683e40a4e88bfa75b3fd01970a2555ede8b58964736f6c63430008120033";

};
