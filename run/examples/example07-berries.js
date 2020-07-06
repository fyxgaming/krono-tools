const bsv = require('bsv')
const Run = require('../dist/run.node.min')

// ----------------------------------------------------------------------------
// Define a berry protocol to read twetch posts
// ----------------------------------------------------------------------------

class TwetchPost extends Berry {
  init (text) {
    this.text = text
  }

  static async pluck (txid, fetch) {
    // The txo returned from fetch is unwriter's txo format
    const txo = await fetch(txid)

    // Twetch posts start with a B protocol and put the text in s3
    if (txo.out[0].s2 === '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut') {
      return new TwetchPost(txo.out[0].s3)
    }
  }
}

// ----------------------------------------------------------------------------
// Read a twetch post and use it in a Jig
// ----------------------------------------------------------------------------

const network = 'main'
const twetchPostTxid = '4e146ac161324ef0b388798462867c29ad681ef4624ea4e3f7c775561af3ddd0'
const purse = 'KxCNcuTavkKd943xAypLjRKufmdXUaooZzWoB4piRRvJK74LYwCR'

async function main () {
  const run = new Run({ network, purse })

  // Deploy the twetch protocol to mainnet. In a production app, we would pre-deploy the protocol.
  await run.deploy(TwetchPost)

  // We use the { protocol } syntax to specify this Twetch protocol is to be used
  const post = await run.load(twetchPostTxid, TwetchPost)

  class MyFavoritePost extends Jig {
    init (post) {
      expect(post).toBeInstanceOf(TwetchPost)
      this.post = post
    }
  }

  MyFavoritePost.deps = { TwetchPost, expect: Run.expect }

  const favorite = await new MyFavoritePost(post).sync()

  console.log(favorite.post.text)
}

main()
