const jsbn = require('./jsbn');
function verify(mSig, mHash, mPubkey) {
    function bint(n) {
        return BigInteger('' + n);
    }

    function bintFromHex(n) {
        let prefix = n[0] == '-' ? '-' : '';
        if (n.indexOf('x') > -1) {
            n = n.split('x')[1];
        }
        return BigInteger(prefix + n, 16);
    }

    function Math_abs(val) {
        return (val < 0) ? -1 * val : val;
    }

    const _0 = bint(0);
    const _1 = bint(1);
    const _2 = bint(2);
    const _3 = bint(3);
    const _4 = bint(4);
    const _7 = bint(7);
    const _8 = bint(8);

    let scope = {};
    const CURVE = {
        a: _0,
        b: _7,
        P: _2.pow(bint(256)).subtract(_2.pow(bint(32))).subtract(bint(977)),
        n: _2.pow(bint(256)).subtract(bint('432420386565659656852420866394968145599')),
        h: _1,
        Gx: bint('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        Gy: bint('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
        beta: bintFromHex('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
    };
    scope.CURVE = CURVE;
    const P_DIV4_1 = CURVE.P.add(_1).divide(_4);
    function weistrass(x) {
        const { a, b } = CURVE;
        return mod(x.pow(_3).add(a.multiply(x)).add(b));
    }
    const PRIME_SIZE = 256;
    const USE_ENDOMORPHISM = CURVE.a === _0;
    class JacobianPoint {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        static fromAffine(p) {
            if (!(p instanceof Point)) {
                throw new TypeError('JacobianPoint#fromAffine: expected Point');
            }
            return new JacobianPoint(p.x, p.y, _1);
        }
        static toAffineBatch(points) {
            const toInv = invertBatch(points.map((p) => p.z));
            return points.map((p, i) => p.toAffine(toInv[i]));
        }
        static normalizeZ(points) {
            return JacobianPoint.toAffineBatch(points).map(JacobianPoint.fromAffine);
        }
        equals(other) {
            const a = this;
            const b = other;
            const az2 = mod(a.z.multiply(a.z));
            const az3 = mod(a.z.multiply(az2));
            const bz2 = mod(b.z.multiply(b.z));
            const bz3 = mod(b.z.multiply(bz2));
            return mod(a.x.multiply(bz2)).equals(mod(az2.multiply(b.x)))
                && mod(a.y.multiply(bz3)).equals(mod(az3.multiply(b.y)));
        }
        negate() {
            return new JacobianPoint(this.x, mod(this.y.negate()), this.z);
        }
        double() {
            const X1 = this.x;
            const Y1 = this.y;
            const Z1 = this.z;
            const A = X1.pow(_2);
            const B = Y1.pow(_2);
            const C = B.pow(_2);
            const D = _2.multiply(X1.add(B).pow(_2).subtract(A).subtract(C));
            const E = _3.multiply(A);
            const F = E.pow(_2);
            const X3 = mod(F.subtract(_2.multiply(D)));
            const Y3 = mod(E.multiply(D.subtract(X3)).subtract(_8.multiply(C)));
            const Z3 = mod(_2.multiply(Y1).multiply(Z1));
            return new JacobianPoint(X3, Y3, Z3);
        }
        add(other) {
            if (!(other instanceof JacobianPoint)) {
                throw new TypeError('JacobianPoint#add: expected JacobianPoint');
            }
            const X1 = this.x;
            const Y1 = this.y;
            const Z1 = this.z;
            const X2 = other.x;
            const Y2 = other.y;
            const Z2 = other.z;
            if (X2.equals(_0) || Y2.equals(_0))
                return this;
            if (X1.equals(_0) || Y1.equals(_0))
                return other;
            const Z1Z1 = Z1.pow(_2);
            const Z2Z2 = Z2.pow(_2);
            const U1 = X1.multiply(Z2Z2);
            const U2 = X2.multiply(Z1Z1);
            const S1 = Y1.multiply(Z2).multiply(Z2Z2);
            const S2 = Y2.multiply(Z1).multiply(Z1Z1);
            const H = mod(U2.subtract(U1));
            const r = mod(S2.subtract(S1));
            if (H.equals(_0)) {
                if (r.equals(_0)) {
                    return this.double();
                }
                else {
                    return JacobianPoint.ZERO;
                }
            }
            const HH = mod(H.pow(_2));
            const HHH = mod(H.multiply(HH));
            const V = U1.multiply(HH);
            const X3 = mod(r.pow(_2).subtract(HHH).subtract(_2.multiply(V)));
            const Y3 = mod(r.multiply(V.subtract(X3)).subtract(S1.multiply(HHH)));
            const Z3 = mod(Z1.multiply(Z2).multiply(H));
            return new JacobianPoint(X3, Y3, Z3);
        }
        multiplyUnsafe(scalar) {
            // if (typeof scalar !== 'number' && typeof scalar !== 'bigint') {
            //     throw new TypeError('Point#multiply: expected number or bigint');
            // }
            let n = mod(bint(scalar), CURVE.n);
            if (n.compareTo(_0) <= 0) {
                throw new Error('Point#multiply: invalid scalar, expected positive integer');
            }
            if (!USE_ENDOMORPHISM) {
                let p = JacobianPoint.ZERO;
                let d = this;
                while (n.compareTo(_0) > 0) {
                    if (n.and(_1).equals(_1))
                        p = p.add(d);
                    d = d.double();
                    n = n.shiftRight(_1);
                }
                return p;
            }
            let [k1neg, k1, k2neg, k2] = splitScalar(n);
            let k1p = JacobianPoint.ZERO;
            let k2p = JacobianPoint.ZERO;
            let d = this;
            while (k1.compareTo(_0) > 0 || k2.compareTo(_0) > 0) {
                if (k1.and(_1).equals(_1))
                    k1p = k1p.add(d);
                if (k2.and(_1).equals(_1))
                    k2p = k2p.add(d);
                d = d.double();
                k1 = k1.shiftRight(_1);
                k2 = k2.shiftRight(_1);
            }
            if (k1neg)
                k1p = k1p.negate();
            if (k2neg)
                k2p = k2p.negate();
            k2p = new JacobianPoint(mod(k2p.x.multiply(CURVE.beta)), k2p.y, k2p.z);
            return k1p.add(k2p);
        }
        precomputeWindow(W) {
            const windows = USE_ENDOMORPHISM ? 128 / W + 2 : 256 / W + 1;
            let points = [];
            let p = this;
            let base = p;
            for (let window = 0; window < windows; window++) {
                base = p;
                points.push(base);
                for (let i = 1; i < 2 ** (W - 1); i++) {
                    base = base.add(p);
                    points.push(base);
                }
                p = base.double();
            }
            return points;
        }
        wNAF(n, affinePoint) {
            if (!affinePoint && this.equals(JacobianPoint.BASE))
                affinePoint = Point.BASE;
            const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
            if (256 % W) {
                throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
            }
            let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
            if (!precomputes) {
                precomputes = this.precomputeWindow(W);
                if (affinePoint && W !== 1) {
                    precomputes = JacobianPoint.normalizeZ(precomputes);
                    pointPrecomputes.set(affinePoint, precomputes);
                }
            }
            let p = JacobianPoint.ZERO;
            let f = JacobianPoint.ZERO;
            const windows = USE_ENDOMORPHISM ? 128 / W + 2 : 256 / W + 1;
            const windowSize = 2 ** (W - 1);
            const mask = bint(2 ** W - 1);
            const maxNumber = 2 ** W;
            const shiftBy = bint(W);
            for (let window = 0; window < windows; window++) {
                const offset = window * windowSize;
                let wbits = Number(n.and(mask).toString());
                n = n.shiftRight(shiftBy);
                if (wbits > windowSize) {
                    wbits -= maxNumber;
                    n = n.add(_1);
                }
                if (wbits === 0) {
                    f = f.add(window % 2 ? precomputes[offset].negate() : precomputes[offset]);
                }
                else {
                    const cached = precomputes[offset + Math_abs(wbits) - 1];
                    p = p.add(wbits < 0 ? cached.negate() : cached);
                }
            }
            return [p, f];
        }
        multiply(scalar, affinePoint) {
            // if (typeof scalar !== 'number' && typeof scalar !== 'bigint') {
            //     throw new TypeError('Point#multiply: expected number or bigint');
            // }
            let n = mod(bint(scalar), CURVE.n);
            if (n.compareTo(_0) <= 0) {
                throw new Error('Point#multiply: invalid scalar, expected positive integer');
            }
            let point;
            let fake;
            if (USE_ENDOMORPHISM) {
                const [k1neg, k1, k2neg, k2] = splitScalar(n);
                let k1p, k2p, f1p, f2p;
                [k1p, f1p] = this.wNAF(k1, affinePoint);
                [k2p, f2p] = this.wNAF(k2, affinePoint);
                if (k1neg)
                    k1p = k1p.negate();
                if (k2neg)
                    k2p = k2p.negate();
                k2p = new JacobianPoint(mod(k2p.x.multiply(CURVE.beta)), k2p.y, k2p.z);
                [point, fake] = [k1p.add(k2p), f1p.add(f2p)];
            }
            else {
                [point, fake] = this.wNAF(n, affinePoint);
            }
            return JacobianPoint.normalizeZ([point, fake])[0];
        }
        toAffine(invZ = invert(this.z)) {
            const invZ2 = invZ.pow(_2);
            const x = mod(this.x.multiply(invZ2));
            const y = mod(this.y.multiply(invZ2).multiply(invZ));
            return new Point(x, y);
        }
    }
    JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1);
    JacobianPoint.ZERO = new JacobianPoint(_0, _0, _1);
    const pointPrecomputes = new WeakMap();
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        _setWindowSize(windowSize) {
            this._WINDOW_SIZE = windowSize;
            pointPrecomputes.delete(this);
        }
        static fromCompressedHex(bytes) {
            if (bytes.length !== 33) {
                throw new TypeError(`Point.fromHex: compressed expects 66 bytes, not ${bytes.length * 2}`);
            }
            const x = arrayToNumber(bytes.slice(1));
            const sqrY = weistrass(x);
            let y = powMod(sqrY, P_DIV4_1, CURVE.P);
            const isFirstByteOdd = (bytes[0] & 1) === 1;
            const isYOdd = (!y.isEven());
            if (isFirstByteOdd !== isYOdd) {
                y = mod(y.negate());
            }
            const point = new Point(x, y);
            point.assertValidity();
            return point;
        }
        static fromUncompressedHex(bytes) {
            if (bytes.length !== 65) {
                throw new TypeError(`Point.fromHex: uncompressed expects 130 bytes, not ${bytes.length * 2}`);
            }
            const x = arrayToNumber(bytes.slice(1, 33));
            const y = arrayToNumber(bytes.slice(33));
            const point = new Point(x, y);
            point.assertValidity();
            return point;
        }
        static fromHex(hex) {
            const bytes = hex instanceof Uint8Array ? hex : hexToArray(hex);
            const header = bytes[0];
            if (header === 0x02 || header === 0x03)
                return this.fromCompressedHex(bytes);
            if (header === 0x04)
                return this.fromUncompressedHex(bytes);
            throw new TypeError('Point.fromHex: received invalid point');
        }
        static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(normalizePrivateKey(privateKey));
        }
        static fromSignature(msgHash, signature, recovery) {
            const sign = normalizeSignature(signature);
            const { r, s } = sign;
            if (r === _0 || s === _0)
                return;
            const rinv = invert(r, CURVE.n);
            const h = typeof msgHash === 'string' ? hexToNumber(msgHash) : arrayToNumber(msgHash);
            const P_ = Point.fromHex(`0${2 + (recovery & 1)}${pad64(r)}`);
            const sP = JacobianPoint.fromAffine(P_).multiplyUnsafe(s);
            const hG = JacobianPoint.BASE.multiply(h).negate();
            const Q = sP.add(hG).multiplyUnsafe(rinv);
            const point = Q.toAffine();
            point.assertValidity();
            return point;
        }
        toRawBytes(isCompressed = false) {
            return hexToArray(this.toHex(isCompressed));
        }
        toHex(isCompressed = false) {
            const x = pad64(this.x);
            if (isCompressed) {
                return `${this.y & _1 ? '03' : '02'}${x}`;
            }
            else {
                return `04${x}${pad64(this.y)}`;
            }
        }
        assertValidity() {
            const { x, y } = this;
            if (x.equals(_0) || y.equals(_0) || x.compareTo(CURVE.P) >= 0 || y.compareTo(CURVE.P) >= 0) {
                throw new TypeError('Point is not on elliptic curve');
            }
            const left = mod(y.multiply(y));
            const right = weistrass(x);
            const valid = left.subtract(right).remainder(CURVE.P).equals(_0);
            if (!valid)
                throw new TypeError('Point is not on elliptic curve');
        }
        equals(other) {
            return this.x.equals(other.x) && this.y.equals(other.y);
        }
        negate() {
            return new Point(this.x, mod(-this.y));
        }
        double() {
            return JacobianPoint.fromAffine(this).double().toAffine();
        }
        add(other) {
            return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
        }
        subtract(other) {
            return this.add(other.negate());
        }
        multiply(scalar) {
            return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
        }
    }
    scope.Point = Point;
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
    Point.ZERO = new Point(_0, _0);
    class SignResult {
        constructor(r, s) {
            this.r = r;
            this.s = s;
        }
        static fromHex(hex) {
            const str = hex instanceof Uint8Array ? arrayToHex(hex) : hex;
            if (typeof str !== 'string')
                throw new TypeError({}.toString.call(hex));
            const check1 = str.slice(0, 2);
            const length = parseByte(str.slice(2, 4));
            const check2 = str.slice(4, 6);
            if (check1 !== '30' || length !== str.length - 4 || check2 !== '02') {
                throw new Error('SignResult.fromHex: Invalid signature');
            }
            const rLen = parseByte(str.slice(6, 8));
            const rEnd = 8 + rLen;
            const r = hexToNumber(str.slice(8, rEnd));
            const check3 = str.slice(rEnd, rEnd + 2);
            if (check3 !== '02') {
                throw new Error('SignResult.fromHex: Invalid signature');
            }
            const sLen = parseByte(str.slice(rEnd + 2, rEnd + 4));
            const sStart = rEnd + 4;
            const s = hexToNumber(str.slice(sStart, sStart + sLen));
            return new SignResult(r, s);
        }
        toRawBytes(isCompressed = false) {
            return hexToArray(this.toHex(isCompressed));
        }
        toHex(isCompressed = false) {
            const sHex = numberToHex(this.s);
            if (isCompressed)
                return sHex;
            const rHex = numberToHex(this.r);
            const rLen = numberToHex(rHex.length / 2);
            const sLen = numberToHex(sHex.length / 2);
            const length = numberToHex(rHex.length / 2 + sHex.length / 2 + 4);
            return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
        }
    }
    scope.SignResult = SignResult;
    function concatTypedArrays(...arrays) {
        if (arrays.length === 1)
            return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
            const arr = arrays[i];
            result.set(arr, pad);
            pad += arr.length;
        }
        return result;
    }
    function arrayToHex(uint8a) {
        let hex = '';
        for (let i = 0; i < uint8a.length; i++) {
            hex += uint8a[i].toString(16).padStart(2, '0');
        }
        return hex;
    }
    function pad64(num) {
        return num.toString(16).padStart(64, '0');
    }
    function numberToHex(num) {
        const hex = num.toString(16);
        return hex.length & 1 ? `0${hex}` : hex;
    }
    function hexToNumber(hex) {
        if (typeof hex !== 'string') {
            throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
        }
        return bintFromHex(`0x${hex}`);
    }
    function hexToArray(hex) {
        hex = hex.length & 1 ? `0${hex}` : hex;
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < array.length; i++) {
            let j = i * 2;
            array[i] = Number.parseInt(hex.slice(j, j + 2), 16);
        }
        return array;
    }
    function arrayToNumber(bytes) {
        return hexToNumber(arrayToHex(bytes));
    }
    function parseByte(str) {
        return Number.parseInt(str, 16) * 2;
    }
    function mod(a, b = CURVE.P) {
        const result = a.remainder(b);
        return result.compareTo(_0) >= 0 ? result : b.add(result);
    }
    function powMod(x, power, order) {
        let res = _1;
        while (power.compareTo(_0) > 0) {
            if (power.and(_1).equals(_1)) {
                res = mod(res.multiply(x), order);
            }
            power = power.shiftRight(_1);
            x = mod(x.multiply(x), order);
        }
        return res;
    }
    function egcd(a, b) {
        let [x, y, u, v] = [_0, _1, _1, _0];
        while (!a.equals(_0)) {
            let q = b.divide(a);
            let r = b.remainder(a);
            let m = x.subtract(u.multiply(q));
            let n = y.subtract(v.multiply(q));
            [b, a] = [a, r];
            [x, y] = [u, v];
            [u, v] = [m, n];
        }
        let gcd = b;
        return [gcd, x, y];
    }
    function invert(number, modulo = CURVE.P) {
        if (number.equals(_0) || modulo.compareTo(_0) <= 0) {
            throw new Error('invert: expected positive integers');
        }
        let [gcd, x] = egcd(mod(number, modulo), modulo);
        if (!gcd.equals(_1)) {
            throw new Error('invert: does not exist');
        }
        return mod(x, modulo);
    }
    function invertBatch(nums, n = CURVE.P) {
        const len = nums.length;
        const scratch = new Array(len);
        let acc = _1;
        for (let i = 0; i < len; i++) {
            if (nums[i].equals(_0))
                continue;
            scratch[i] = acc;
            acc = mod(acc.multiply(nums[i]), n);
        }
        acc = invert(acc, n);
        for (let i = len - 1; i >= 0; i--) {
            if (nums[i].equals(_0))
                continue;
            let tmp = mod(acc.multiply(nums[i]), n);
            nums[i] = mod(acc.multiply(scratch[i]), n);
            acc = tmp;
        }
        return nums;
    }
    function splitScalar(k) {
        const { n } = CURVE;
        const a1 = bintFromHex('0x3086d221a7d46bcde86c90e49284eb15');
        const b1 = bintFromHex('-0xe4437ed6010e88286f547fa90abfe4c3');
        const a2 = bintFromHex('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
        const b2 = a1;
        const c1 = b2.multiply(k).divide(n);
        const c2 = b1.negate().multiply(k).divide(n);
        const k1 = k.subtract(c1.multiply(a1)).subtract(c2.multiply(a2));
        const k2 = c1.negate().multiply(b1).subtract(c2.multiply(b2));
        const k1neg = k1.compareTo(_0) < 0;
        const k2neg = k2.compareTo(_0) < 0;
        return [k1neg, k1neg ? k1.negate() : k1, k2neg, k2neg ? k2.negate() : k2];
    }
    function truncateHash(hash) {
        hash = typeof hash === 'string' ? hash : arrayToHex(hash);
        let msg = hexToNumber(hash || '0');
        const delta = (hash.length / 2) * 8 - PRIME_SIZE;
        if (delta > 0) {
            msg = msg.shiftRight(bint(delta));
        }
        if (msg.compareTo(CURVE.n) >= 0) {
            msg = msg.subtract(CURVE.n);
        }
        return msg;
    }
    async function getQRSrfc6979(msgHash, privateKey) {
        const num = typeof msgHash === 'string' ? hexToNumber(msgHash) : arrayToNumber(msgHash);
        const h1 = hexToArray(pad64(num));
        const x = hexToArray(pad64(privateKey));
        const h1n = arrayToNumber(h1);
        let v = new Uint8Array(32).fill(1);
        let k = new Uint8Array(32).fill(0);
        const b0 = Uint8Array.from([0x00]);
        const b1 = Uint8Array.from([0x01]);
        k = await scope.utils.hmacSha256(k, v, b0, x, h1);
        v = await scope.utils.hmacSha256(k, v);
        k = await scope.utils.hmacSha256(k, v, b1, x, h1);
        v = await scope.utils.hmacSha256(k, v);
        for (let i = 0; i < 1000; i++) {
            v = await scope.utils.hmacSha256(k, v);
            const T = arrayToNumber(v);
            let qrs;
            if (isValidPrivateKey(T) && (qrs = calcQRSFromK(T, h1n, privateKey))) {
                return qrs;
            }
            k = await scope.utils.hmacSha256(k, v, b0);
            v = await scope.utils.hmacSha256(k, v);
        }
        throw new TypeError('secp256k1: Tried 1,000 k values for sign(), all were invalid');
    }
    function isValidPrivateKey(privateKey) {
        return 0 < privateKey && privateKey < CURVE.n;
    }
    function calcQRSFromK(k, msg, priv) {
        const max = CURVE.n;
        const q = Point.BASE.multiply(k);
        const r = mod(q.x, max);
        const s = mod(invert(k, max) * (msg + r * priv), max);
        if (r === _0 || s === _0)
            return;
        return [q, r, s];
    }
    function normalizePrivateKey(privateKey) {
        if (!privateKey)
            throw new Error(`Expected receive valid private key, not "${privateKey}"`);
        let key;
        if (privateKey instanceof Uint8Array) {
            key = arrayToNumber(privateKey);
        }
        else if (typeof privateKey === 'string') {
            key = hexToNumber(privateKey);
        }
        else {
            key = bint(privateKey);
        }
        return key;
    }
    function normalizePublicKey(publicKey) {
        return publicKey instanceof Point ? publicKey : Point.fromHex(publicKey);
    }
    function normalizeSignature(signature) {
        return signature instanceof SignResult ? signature : SignResult.fromHex(signature);
    }
    function getPublicKey(privateKey, isCompressed = false) {
        const point = Point.fromPrivateKey(privateKey);
        if (typeof privateKey === 'string') {
            return point.toHex(isCompressed);
        }
        return point.toRawBytes(isCompressed);
    }
    scope.getPublicKey = getPublicKey;
    function recoverPublicKey(msgHash, signature, recovery) {
        const point = Point.fromSignature(msgHash, signature, recovery);
        if (!point)
            return;
        return typeof msgHash === 'string' ? point.toHex() : point.toRawBytes();
    }
    scope.recoverPublicKey = recoverPublicKey;
    function isPub(item) {
        const arr = item instanceof Uint8Array;
        const str = typeof item === 'string';
        const len = (arr || str) && item.length;
        if (arr)
            return len === 33 || len === 65;
        if (str)
            return len === 66 || len === 130;
        if (item instanceof Point)
            return true;
        return false;
    }
    function getSharedSecret(privateA, publicB, isCompressed = false) {
        if (isPub(privateA) && !isPub(publicB)) {
            [privateA, publicB] = [publicB, privateA];
        }
        else if (!isPub(publicB)) {
            throw new Error('Received invalid keys');
        }
        const b = publicB instanceof Point ? publicB : Point.fromHex(publicB);
        b.assertValidity();
        const shared = b.multiply(normalizePrivateKey(privateA));
        return typeof privateA === 'string'
            ? shared.toHex(isCompressed)
            : shared.toRawBytes(isCompressed);
    }
    scope.getSharedSecret = getSharedSecret;
    async function sign(msgHash, privateKey, { recovered, canonical } = {}) {
        if (msgHash == null)
            throw new Error(`Expected valid msgHash, not "${msgHash}"`);
        const priv = normalizePrivateKey(privateKey);
        const [q, r, s] = await getQRSrfc6979(msgHash, priv);
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1);
        let adjustedS = s;
        const HIGH_NUMBER = CURVE.n >> _1;
        if (s > HIGH_NUMBER && canonical) {
            adjustedS = CURVE.n - s;
            recovery ^= 1;
        }
        const sig = new SignResult(r, adjustedS);
        const hashed = typeof msgHash === 'string' ? sig.toHex() : sig.toRawBytes();
        return recovered ? [hashed, recovery] : hashed;
    }
    scope.sign = sign;
    function verify(signature, msgHash, publicKey) {
        const h = truncateHash(msgHash);
        const { r, s } = normalizeSignature(signature);
        const pubKey = JacobianPoint.fromAffine(normalizePublicKey(publicKey));
        const s1 = invert(s, CURVE.n);
        const Ghs1 = JacobianPoint.BASE.multiply(mod(h.multiply(s1), CURVE.n));
        const Prs1 = pubKey.multiplyUnsafe(mod(r.multiply(s1), CURVE.n));
        const res = Ghs1.add(Prs1).toAffine();
        return res.x.equals(r);
    }
    scope.verify = verify;
    Point.BASE._setWindowSize(8);
    scope.utils = {
        isValidPrivateKey(privateKey) {
            return isValidPrivateKey(normalizePrivateKey(privateKey));
        },
        randomPrivateKey: (bytesLength = 32) => {
            if (typeof window == 'object' && 'crypto' in window) {
                return window.crypto.getRandomValues(new Uint8Array(bytesLength));
            }
            else if (typeof process === 'object' && 'node' in process.versions) {
                const { randomBytes } = require('crypto');
                return new Uint8Array(randomBytes(bytesLength).buffer);
            }
            else {
                throw new Error("The environment doesn't have randomBytes function");
            }
        },
        hmacSha256: async (key, ...messages) => {
            if (typeof window == 'object' && 'crypto' in window) {
                const ckey = await window.crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign', 'verify']);
                const message = concatTypedArrays(...messages);
                const buffer = await window.crypto.subtle.sign('HMAC', ckey, message);
                return new Uint8Array(buffer);
            }
            else if (typeof process === 'object' && 'node' in process.versions) {
                const { createHmac, randomBytes } = require('crypto');
                const hash = createHmac('sha256', key);
                for (let message of messages) {
                    hash.update(message);
                }
                return Uint8Array.from(hash.digest());
            }
            else {
                throw new Error("The environment doesn't have hmac-sha256 function");
            }
        },
        precompute(windowSize = 8, point = Point.BASE) {
            const cached = point === Point.BASE ? point : new Point(point.x, point.y);
            cached._setWindowSize(windowSize);
            cached.multiply(_3);
            return cached;
        },
    };

    return scope.verify(mSig, mHash, mPubkey);
}

verify.deps = {
    BigInteger: jsbn()
}

module.exports = verify;