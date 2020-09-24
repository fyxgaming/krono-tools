const {Token} = require('@kronoverse/run');

class KronoCoin extends Token {}

KronoCoin.decimals = 4;

module.exports = KronoCoin;