//Este arquivo é responsável por conectar e inserir informações
//no cluster online, hosteado por MongoDB Atlas.

const { MongoClient } = require("mongodb");
                                                                                                                                
const url = "mongodb+srv://scaglione:senha1234@cluster0.hkzjohs.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);

const dbName = "test"

async function addPessoaDB() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        // Use the collection "people"
        const col = db.collection("people");
        // Construct a document                                                                                                                                                              
        let personDocument = {
            "name": { "first": "Alan", "last": "Turing" },
            "birth": new Date(1912, 5, 23), // May 23, 1912                                                                                                                                 
            "death": new Date(1954, 5, 7),  // May 7, 1954                                                                                                                                  
            "contribs": [ "Turing machine", "Turing test", "Turingery" ],
            "views": 1250000
        }
        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(personDocument);
        // Find one document
        const myDoc = await col.findOne();
        // Print to the console
        console.log(myDoc);

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}
run().catch(console.dir);

module.exports = addPessoaDB;

//export default addPessoaDB;