class Math {
    static abs(val) {
        return (val < 0) ? -1 * val : val;
    }

    static floor(a) {
        let op = a.toString().indexOf('e-') > -1 ? 0 : Number.parseInt(a);
        return op;
    }

    static pow(a, b) {
        let op = Number.parseFloat(a) ** b;
        return op;
    }

    static max(a, b) {
        if (a === null || b === null) return NaN;
        let an = Number(a);
        let bn = Number(b);
        let op = NaN;
        if (Number.isNaN(an) || Number.isNaN(bn)) {
            op = NaN;
        } else {
            op = an > bn ? an : bn;
        }
        return op;
    }

    static min(a, b) {
        if (a === null || b === null) return NaN;
        let an = Number(a);
        let bn = Number(b);
        let op = NaN;
        if (Number.isNaN(an) || Number.isNaN(bn)) {
            op = NaN;
        } else {
            op = an < bn ? an : bn;
        }
        return op;
    }

    //ln(x) = log(x) ÷ log(2.71828)
    static log(a) {
        let n = 10000.0;
        let op = n * ((a ** (1 / n)) - 1);
        return op;
    }

    static random() {
        throw new Error('random not supported!');
    }
}

Math.LN2 = 0.6931471805599453;

module.exports = Math;