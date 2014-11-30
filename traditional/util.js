div = function(a, b) {
    return Math.floor(a/b);
};

divMod = function(n, d) {
    var divisor = div(n, d);
    var mod = n - (d * divisor);
    return [divisor, mod];
};

zip = function (fn, as, bs) {
    ret = [];
    for (i = 0; i < Math.min(as.length, bs.length); i ++) {
        ret.push(fn(as[i], bs[i]));
    }
    return ret;
};
