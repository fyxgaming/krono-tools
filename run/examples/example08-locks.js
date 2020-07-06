const bsv = require('bsv')
const Run = require('../dist/run.node.min')
const { asm } = Run

// A locking script which to spend must input the value of 2+2
class TwoPlusTwoLock {
  script () { return asm('OP_2 OP_2 OP_ADD OP_EQUAL') }
  domain () { return 1 } // domain is the max size of the unlock script
}

TwoPlusTwoLock.deps = { asm }

// Create a custom owner that is capable of unlocking TwoPlusTwoLocks
class TwoPlusTwoKey {
  // Returns the owner assigned to the next jig
  owner () { return new TwoPlusTwoLock() }

  // Unlocks a locking script
  async sign (txhex, locks) {
    const tx = new bsv.Transaction(txhex)

    // Find each input that is a TwoPlusTwo lock and sign it with 4
    tx.inputs
      .filter((_, n) => locks[n] instanceof TwoPlusTwoLock)
      .forEach(input => input.setScript('OP_4'))
    
    return tx.toString('hex')
  }
}

// A basic jig that we can update the properties on
class Dragon extends Jig {
  setName(name) { this.name = name }
}

async function main () {
  const run = new Run({ network: 'mock', owner: new TwoPlusTwoKey() })

  const dragon = new Dragon()
  await dragon.sync()

  dragon.setName('Victoria')
  await dragon.sync()

  console.log('Unlocked the custom lock')
}

main().catch(e => console.error(e))
