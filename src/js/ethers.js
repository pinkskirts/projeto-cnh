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

  var contratoAtual = null;
  var enderecoContratoAtual = null;
  var conta = null;
  var signer;
  var provedor;
  var contractAddresses = [];
  var carteira = null;

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

  // Conexões
  const conectarMeta = document.getElementById("conectar"); // Botão conectar -> Metamask browser add-on
  const contaConectada = document.getElementById("contaConectada"); // Texto do endereço da conta conectada (Wallet MetaMask)
  const contratoAtualText = document.getElementById("contratoText"); // Texto do endereço do contrato

  // Contratos disponíveis
  var parentElementContratos = document.getElementById("contratos"); // Elemento pai dos botões (ul contratos)
  var contratosInexistentesElement = document.createElement("p");

  // Adicionar novo contrato
  const acionarNovoContratoButton = document.getElementById("acionarContrato");

  // Registrar
  const nome = document.getElementById("nomeInput");
  const registro = document.getElementById("registroInput");
  var botaoRegistrar = document.createElement("button");
  botaoRegistrar.innerHTML = "Registrar";

  // Consultar CNH
  const inputConsulta = document.getElementById("inputConsulta");
  const botaoConsultar = document.getElementById("consultar");
  const botaoLimpar = document.getElementById("limpar");
  var resultadoConsultaElement = document.getElementById("resultadoConsulta");
  var resultadoTextoElement = document.createElement("p");
  var camposConsulta = document.createElement("ul");

  // Histórico do contrato
  var parentDivCNHsBox = document.getElementById("divcnhsbox");
  var parentUlCNHs = document.getElementById("cnhs"); // Elemento pai dos paragrafos (ul cnhs)
  var subtituloElement = document.createElement("p"); // Elemento subtitulo da listagem das CNHs
  var divhrElement = document.getElementById("divhr");

  //Alterar CNH
  var inputRegistroAlterar = document.getElementById("registroAlterar");
  var checkboxNome = document.getElementById("nomeAlterar");
  var checkboxValidade = document.getElementById("validadeAlterar");
  var parentDivCampoNome = document.getElementById("campoNome");
  var parentDivCampoValidade = document.getElementById("campoValidade");
  var botaoAlterarNome = document.createElement("button");
  var botaoAlterarValidade = document.createElement("button");
  botaoAlterarNome.innerHTML = "Alterar";
  botaoAlterarValidade.innerHTML = "Alterar";

  // Outros + DEBUG (verificar browser console)
  const botaoDebug = document.getElementById("debug");
  var labelValidade = document.createElement("label");
  var inputValidade = document.createElement("input");
  var labelNome = document.createElement("label");
  var inputNome = document.createElement("input");

  inputValidade.type = "date";
  inputValidade.setAttribute("id", "inputValidade");

  inputNome.type = "text";
  inputNome.setAttribute("pattern", "^[a-zA-Z_ ]*$");
  inputNome.setAttribute("id", "inputNome");

  labelValidade.setAttribute("for", "inputValidade");
  labelNome.setAttribute("for", "inputNome");

  // Atribuição das funções aos botões
  conectarMeta.onclick = conectar;
  acionarNovoContratoButton.onclick = acionarContrato;
  botaoRegistrar.onclick = adicionarCNH;
  botaoConsultar.onclick = consultar;
  botaoLimpar.onclick = limpar;
  botaoDebug.onclick = debug;
  botaoAlterarNome.onclick = mudarNome;
  botaoAlterarValidade.onclick = mudarValidade;

  parentElementContratos.addEventListener("click", function (event) {
    if (conta !== null) {
      // Verifica se o evento foi originado pelo botão dinamicamente adicionado
      if (event.target.classList.contains("botoes-contrato")) {
        // Manipula o evento do botão
        contratoAtualText.innerText = `Contrato selecionado: ${event.target.innerHTML}`;
        enderecoContratoAtual = event.target.innerHTML;

        contratoAtual = new ethers.Contract(enderecoContratoAtual, abi, signer); // Atualizacao do contrato
        contratoAtual.attach(enderecoContratoAtual);

        limparParentElement(parentUlCNHs); // Remove todos os elementos-filho da div
        loadCNHs();
      }
    } else {
      alert("Por favor, conecte-se ao MetaMask!");
    }
  });

  // Escolha entre as opções de adição de validade
  formValidade.addEventListener("change", function (event) {
    var opcaoSelecionada = event.target.value;

    limparParentElement(addValidadeElement);
    if (opcaoSelecionada === "manual") {
      gerarElementsManual();
    } else {
      gerarElementsAutomatico();
    }
  });

  checkboxNome.addEventListener("change", function () {
    if (checkboxNome.checked) {
      // check
      gerarElementsAlterarNome();
    } else {
      // uncheck
      limparParentElement(parentDivCampoNome);
    }
  });

  checkboxValidade.addEventListener("change", function (event) {
    if (checkboxValidade.checked) {
      // check
      gerarElementsAlterarValidade();
    } else {
      // uncheck
      limparParentElement(parentDivCampoValidade);
    }
  });

  provedor = new ethers.providers.Web3Provider(window.ethereum);
  signer = provedor.getSigner(); // Retorna a carteira (objeto da carteira) assinante das transacoes, atrelada ao provedor (Metamask)
  loadContratos(); // Inicia o carregamento dos contratos disponíveis

  async function conectar() {
    if (typeof window.ethereum != undefined && conta == null) {
      try {
        conta = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (conta !== null) {
          // Atualiza as labels conforme a operação de login na extensão é realizada
          contaConectada.innerHTML = `Conta conectada: ${conta}`;
          conectarMeta.innerHTML = "Conectado!";
        }
      } catch (error) {
        // Caso o usuário possua a extensão, mas não tenha se conectado ainda
        alert("Por favor, conecte-se ao MetaMask!");
      }
    } else {
      alert("Conexão já estabelecida!");
    }
  }

  async function acionarContrato() {
    provedor = new ethers.providers.JsonRpcProvider(RPC_URL);
    carteira = new ethers.Wallet(CHAVE_PRIVADA, provedor);
    const contractFactory = new ethers.ContractFactory(abi, binario, carteira);
    contratoAtual = await contractFactory.deploy(); // Gera o initcode do contrato
    contratoAtual = new ethers.Contract(contratoAtual.address, abi, signer); // Atualizacao do contrato

    // Adiciona o novo contrato instanciado a lista (HTML) de contratos disponíveis
    var novoContratoButton = document.createElement("button");
    novoContratoButton.innerText = contratoAtual.address;
    novoContratoButton.classList = "botoes-contrato";
    parentElementContratos.appendChild(novoContratoButton);
    contratosInexistentesElement.innerText = "";
  }

  async function adicionarCNH() {
    if (typeof window.ethereum != undefined && enderecoContratoAtual != null) {
      provedor = new ethers.providers.Web3Provider(window.ethereum); // Provedor = Metamask

      const nomeRegistro = nome.value;
      const numeroRegistro = parseInt(registro.value);


      console.log("Nome inserido:", nomeRegistro, typeof nomeRegistro); // debug
      console.log("Registro inserido:", numeroRegistro, typeof numeroRegistro); // debug

      try {
        const transactionResponse = await contratoAtual.addCNH(
          nomeRegistro,
          numeroRegistro
        );
        await listenForTransactionMine(transactionResponse, provedor);
        subtituloElement.innerText = "Registros disponíveis:";
        loadCNHs();
      } catch (error) {
        console.log(error);
      }
    } else if (typeof window.ethereum != undefined) {
      alert("Escolha um contrato primeiro!");
    } else {
      alert("Por favor, conecte-se ao MetaMask!");
    }
  }

  async function consultar() {
    if (typeof window.ethereum != undefined && contratoAtual != null) {
      try {
        limparParentElement(resultadoConsultaElement);
        limparParentElement(camposConsulta);

        var size = (await contratoAtual.getCNHlength()).toNumber();
        if (size == 0) {
          alert("Contrato não possui CNHs armazenadas.");
        } else {
          var nomeArmazenado;
          var registroArmazenado = null;
          var aux;

          for (var i = 0; i < size; i++) {
            aux = await contratoAtual.CNHS(i);
            if (aux.registro == inputConsulta.value) {
              nomeArmazenado = aux.nome;
              registroArmazenado = inputConsulta.value;
            }
          }
          resultadoTextoElement.innerText = "Resultado:";
          resultadoConsultaElement.appendChild(resultadoTextoElement);

          if (registroArmazenado !== null) {
            var nomeConsultaElement = document.createElement("li");
            var registroConsultaElement = document.createElement("li");

            nomeConsultaElement.innerText = "Nome: " + nomeArmazenado;
            registroConsultaElement.innerText =
              "Registro: " + registroArmazenado;

            resultadoConsultaElement.appendChild(camposConsulta);
            camposConsulta.appendChild(nomeConsultaElement);
            camposConsulta.appendChild(registroConsultaElement);
          } else {
            var CNHNotFoundElement = document.createElement("p");
            CNHNotFoundElement.innerText = "CNH não encontrada!";
            resultadoConsultaElement.appendChild(CNHNotFoundElement);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else if (typeof window.ethereum != undefined) {
      alert("Escolha um contrato primeiro!");
    } else {
      alert("Por favor, conecte-se ao MetaMask!");
    }
  }

  // Devolve a confirmação da transação no bloco
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

  // Carrega os endereços dos contratos do Ganache
  async function loadContratos() {
    provedor = new ethers.providers.JsonRpcProvider(RPC_URL);

    const blockNumber = await provedor.getBlockNumber();

    // Carrega os endereços e os armazenam em "contractAddresses"
    for (let i = 0; i <= blockNumber; i++) {
      const block = await provedor.getBlockWithTransactions(i);

      for (const transaction of block.transactions) {
        const receipt = await provedor.getTransactionReceipt(transaction.hash);

        if (receipt.contractAddress) {
          contractAddresses.push(receipt.contractAddress);
        }
      }
    }

    console.log(contractAddresses); // debug

    if (contractAddresses.length == 0) {
      // Caso não haja contratos estabelecidos
      contratosInexistentesElement.innerText = "Contratos inexistentes!";
      parentElementContratos.appendChild(contratosInexistentesElement);
    } else {
      provedor = new ethers.providers.JsonRpcProvider(RPC_URL);
      carteira = new ethers.Wallet(CHAVE_PRIVADA, provedor);

      // Cria um número N de botões de acordo com o número de contratos disponíveis
      for (let i = 0; i < contractAddresses.length; i++) {
        var novoElementoButton = document.createElement("button"); // Cria um novo elemento botão
        novoElementoButton.innerText = contractAddresses[i].toString();
        novoElementoButton.classList = "botoes-contrato";

        parentElementContratos.appendChild(novoElementoButton);
        parentElementContratos.appendChild(document.createElement("br"));
      }
    }
  }

  // Carrega as CNHs dispostas no contrato selecionado
  async function loadCNHs() {
    if (typeof window.ethereum != undefined && contratoAtual != undefined) {
      let registroArmazenado;
      limparParentElement(parentUlCNHs);
      limparParentElement(divhrElement);

      try {
        var size = (await contratoAtual.getCNHlength()).toNumber();
        console.log("Quantidade de CNHs no contrato: " + size); // debug

        divhrElement.appendChild(document.createElement("hr"));

        if (size === 0) {
          subtituloElement.innerText = "Contrato vazio!";
          parentDivCNHsBox.classList = "";
          parentUlCNHs.appendChild(subtituloElement);
        } else {
          subtituloElement.innerText = "Registros disponíveis:";
          parentDivCNHsBox.classList = "box";
          parentUlCNHs.appendChild(subtituloElement);

          for (let i = 0; i < size; i++) {
            var elemento = await contratoAtual.CNHS(i);

            registroArmazenado = elemento.registro.toNumber();

            console.log("Registro: " + registroArmazenado); // debug

            var contadorElement = document.createElement("li");
            contadorElement.innerText = "# - " + (i + 1).toString();
            parentUlCNHs.appendChild(contadorElement);

            var registroArmazenadoElement = document.createElement("li");
            registroArmazenadoElement.innerText =
              "Registro: " + registroArmazenado;
            parentUlCNHs.appendChild(registroArmazenadoElement);
            parentUlCNHs.appendChild(document.createElement("br"));
          }
          console.log(parentDivCNHsBox); // debug
        }
      } catch (error) {
        console.log(error);
        alert("Por favor, espere a finalização da inicialização do contrato.");
      }
    }
  }

  async function mudarNome() {
    if (typeof window.ethereum != undefined && contratoAtual != undefined) {
      try {
        var size = (await contratoAtual.getCNHlength()).toNumber();
        let aux;

        for (var i = 0; i < size; i++) {
          aux = await contratoAtual.CNHS(i);
          if (aux.registro == inputRegistroAlterar.value) {
            try {
              var transactionResponse = await contratoAtual.alterarNome(
                i,
                inputNome.value
              );
              await listenForTransactionMine(transactionResponse, provedor);
            } catch (error) {
              console.log(error);
            }
          }
        }
        loadCNHs();
      } catch (error) {
        console.log(error); // debug
      }
    } else {
      alert("Escolha um contrato primeiro!");
    }
  }

  async function mudarValidade() {
    if (typeof window.ethereum != undefined && contratoAtual != undefined) {
      try {
        var size = (await contratoAtual.getCNHlength()).toNumber();
        let aux;

        let validade = converterDataParaUnixEpoch(inputValidade.value);
        console.log(validade);

        for (var i = 0; i < size; i++) {
          aux = await contratoAtual.CNHS(i);
          if (aux.registro == inputRegistroAlterar.value) {
            try {
              var transactionResponse = await contratoAtual.alterarValidade(
                i,
                validade
              );
              await listenForTransactionMine(transactionResponse, provedor);
            } catch (error) {
              console.log(error);
            }
          }
        }
        loadCNHs();
      } catch (error) {
        console.log(error); // debug
      }
    } else {
      alert("Escolha um contrato primeiro!");
    }
  }


  function getEpochAtual() {
    var dataAtual = new Date();
    var tempoEmMilissegundos = dataAtual.getTime();
    var tempoEmSegundos = Math.floor(tempoEmMilissegundos / 1000);
    return tempoEmSegundos;
  }

  function converterDataParaUnixEpoch(dataString) {
    var data = new Date(dataString);
    var segundos = Math.floor(data.getTime() / 1000);
    return segundos;
  }

  function converterUnixEpochParaData(unixEpoch) {
    var data = new Date(unixEpoch * 1000 + 86400);
    var ano = data.getFullYear();
    var mes = String(data.getMonth() + 1).padStart(2, "0");
    var dia = String(data.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
  }

  async function debug() {
    if (typeof window.ethereum == undefined || contratoAtual == null) {
      alert("Escolha um contrato primeiro!");
    } else {
      console.log("Data atual (Unix Epoch): ", getEpochAtual());
      console.log("Data atual: ", converterUnixEpochParaData(getEpochAtual()));
      console.log("Provedor: ", provedor);
      console.log("Signer: ", signer);
      console.log("Contrato: ", contratoAtual);
      console.log("Endereço do contrato: ", contratoAtual.address); //debug
      console.log(contratoAtual.deployTransaction);
      console.log(contratoAtual.interface);
      console.log(contratoAtual.provider);
      console.log(contratoAtual.signer);
      console.log(conta);
    }
  }

  // Elimina um elemento DOM e todos os seus elementos-filho subsequentes
  function limparParentElement(_parentElement) {
    if (_parentElement.hasChildNodes) {
      while (_parentElement.firstChild) {
        _parentElement.removeChild(_parentElement.firstChild);
      }
    }
  }

  function limpar() {
    resultadoTextoElement.innerHTML = "";
    limparParentElement(camposConsulta);
    parentDivCNHsBox.classList = "";
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
        {
          internalType: "uint256",
          name: "_validade",
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
          name: "_nome",
          type: "string",
        },
      ],
      name: "alterarNome",
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
          internalType: "uint256",
          name: "_validade",
          type: "uint256",
        },
      ],
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
    "608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610b05806100616000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80635d9e5ff51461005c57806394178df71461008e578063cccf67c4146100aa578063f372379b146100c6578063f3a31f24146100e4575b600080fd5b6100766004803603810190610071919061045d565b610100565b60405161008593929190610529565b60405180910390f35b6100a860048036038101906100a3919061069c565b6101c2565b005b6100c460048036038101906100bf919061070b565b610293565b005b6100ce610324565b6040516100db9190610767565b60405180910390f35b6100fe60048036038101906100f99190610782565b61038b565b005b6000818154811061011057600080fd5b9060005260206000209060030201600091509050806000018054610133906107f1565b80601f016020809104026020016040519081016040528092919081815260200182805461015f906107f1565b80156101ac5780601f10610181576101008083540402835291602001916101ac565b820191906000526020600020905b81548152906001019060200180831161018f57829003601f168201915b5050505050908060010154908060020154905083565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461021c57600080fd5b60006040518060600160405280858152602001848152602001838152509080600181540180825580915050600190039060005260206000209060030201600090919091909150600082015181600001908161027791906109ce565b5060208201518160010155604082015181600201555050505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102ed57600080fd5b806000838154811061030257610301610aa0565b5b9060005260206000209060030201600001908161031f91906109ce565b505050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461038057600080fd5b600080549050905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146103e557600080fd5b80600083815481106103fa576103f9610aa0565b5b9060005260206000209060030201600201819055505050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61043a81610427565b811461044557600080fd5b50565b60008135905061045781610431565b92915050565b6000602082840312156104735761047261041d565b5b600061048184828501610448565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156104c45780820151818401526020810190506104a9565b60008484015250505050565b6000601f19601f8301169050919050565b60006104ec8261048a565b6104f68185610495565b93506105068185602086016104a6565b61050f816104d0565b840191505092915050565b61052381610427565b82525050565b6000606082019050818103600083015261054381866104e1565b9050610552602083018561051a565b61055f604083018461051a565b949350505050565b600080fd5b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6105a9826104d0565b810181811067ffffffffffffffff821117156105c8576105c7610571565b5b80604052505050565b60006105db610413565b90506105e782826105a0565b919050565b600067ffffffffffffffff82111561060757610606610571565b5b610610826104d0565b9050602081019050919050565b82818337600083830152505050565b600061063f61063a846105ec565b6105d1565b90508281526020810184848401111561065b5761065a61056c565b5b61066684828561061d565b509392505050565b600082601f83011261068357610682610567565b5b813561069384826020860161062c565b91505092915050565b6000806000606084860312156106b5576106b461041d565b5b600084013567ffffffffffffffff8111156106d3576106d2610422565b5b6106df8682870161066e565b93505060206106f086828701610448565b925050604061070186828701610448565b9150509250925092565b600080604083850312156107225761072161041d565b5b600061073085828601610448565b925050602083013567ffffffffffffffff81111561075157610750610422565b5b61075d8582860161066e565b9150509250929050565b600060208201905061077c600083018461051a565b92915050565b600080604083850312156107995761079861041d565b5b60006107a785828601610448565b92505060206107b885828601610448565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061080957607f821691505b60208210810361081c5761081b6107c2565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026108847fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610847565b61088e8683610847565b95508019841693508086168417925050509392505050565b6000819050919050565b60006108cb6108c66108c184610427565b6108a6565b610427565b9050919050565b6000819050919050565b6108e5836108b0565b6108f96108f1826108d2565b848454610854565b825550505050565b600090565b61090e610901565b6109198184846108dc565b505050565b5b8181101561093d57610932600082610906565b60018101905061091f565b5050565b601f8211156109825761095381610822565b61095c84610837565b8101602085101561096b578190505b61097f61097785610837565b83018261091e565b50505b505050565b600082821c905092915050565b60006109a560001984600802610987565b1980831691505092915050565b60006109be8383610994565b9150826002028217905092915050565b6109d78261048a565b67ffffffffffffffff8111156109f0576109ef610571565b5b6109fa82546107f1565b610a05828285610941565b600060209050601f831160018114610a385760008415610a26578287015190505b610a3085826109b2565b865550610a98565b601f198416610a4686610822565b60005b82811015610a6e57848901518255600182019150602085019450602081019050610a49565b86831015610a8b5784890151610a87601f891682610994565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea2646970667358221220af0d0e5560280585d6bc0c640c7cf0fd153800804ed70208251eea940461837964736f6c63430008120033";
};
