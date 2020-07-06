// import { Transaction } from 'bsv';
// import * as dotenv from 'dotenv';
// import { MongoClient } from 'mongodb';
// import * as path from 'path';
// import { MongoBlockchain } from '../lib/blockchain/mongo-blockchain';

// dotenv.config({ path: path.resolve(__dirname, '../.env') });
// const connString: string = process.env.MONGO || '';
// MongoClient.connect(connString, { useUnifiedTopology: true }, async (err, client) => {
//     if (err) throw err;
//     try {
//         const blockchain = new MongoBlockchain(client);
//         const utxos = await blockchain.utxos(process.env.CHANGE);
//         let totalFunds = utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
//         console.log('totalFunds', totalFunds);

//         if (totalFunds < 5000000 && utxos.length < 50) return;

//         const tx = new Transaction()
//             .from(utxos);
//         let outputs = 0;
//         let funds = 0;
//         while (totalFunds > 200000 && outputs++ < 100) {
//             tx.to(process.env.PURSE, 100000);
//             totalFunds -= 100000;
//             funds += 100000;
//         }
//         tx.change(process.env.CHANGE);
//         tx.sign(process.env.CHANGEWIF);
//         await blockchain.broadcast(tx);
//     } catch (e) {
//         console.error(e);
//     } finally {
//         process.exit();
//     }
// });
