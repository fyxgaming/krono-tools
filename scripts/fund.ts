// import { Address, Transaction } from 'bsv';
// import * as dotenv from 'dotenv';
// import { MongoClient } from 'mongodb';
// import * as path from 'path';

// dotenv.config({ path: path.resolve(__dirname, '../.env') });
// const SATOSHIS = 100000000;

// MongoClient.connect(process.env.MONGO, { useUnifiedTopology: true }, async (err, client) => {
//     if (err) throw err;
//     try {
//         const tx = new Transaction()
//             .addData(Math.random().toString())
//             .to(new Address(process.env.CHANGE, process.env.BSVNETWORK), SATOSHIS);

//         await client.db('blockchain').collection('txns').insertOne({
//             _id: tx.hash,
//             rawtx: tx.toBuffer().toString('base64'),
//             spent: tx.outputs.map(() => null),
//             ts: Date.now(),
//         });

//         const out = tx.outputs[1];
//         await client.db('blockchain').collection('utxos').insertOne({
//             _id: `${tx.hash}_o1`,
//             address: out.script.toAddress(process.env.BSVNETWORK).toString(),
//             script: out.script.toString(),
//             satoshis: out.satoshis,
//             txid: tx.hash,
//             ts: Date.now(),
//             vout: 1
//         });
//     } finally {
//         process.exit();
//     }
// });
