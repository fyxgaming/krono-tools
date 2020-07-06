/**
 * This example demonstrates creating a real token on testnet using node.js.
 *
 * To run, execute `node example03-testnet.js` from its directory.
 */

const Run = require('../dist/run.node.min')

const purse = 'cQP1h2zumWrCr2zxciuNeho61QUGtQ4zBKWFauk7WEhFb8kvjRTh'
const run = new Run({ network: 'test', purse })

async function main () {
  class SimpleStore extends Jig {
    set (value) {
      this.value = value
    }
  }

  const token = new SimpleStore()

  token.set('Satoshi Nakamoto')

  await token.sync()

  const token2 = await run.load(token.location)

  console.log('Same token: ', token.value === token2.value)
  console.log('Token location', token2.location)
}

main().catch(e => console.error(e))
