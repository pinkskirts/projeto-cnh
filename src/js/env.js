require("dotenv").config();

const CHAVE_PRIVADA = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

module.exports = CHAVE_PRIVADA;
module.exports = RPC_URL;