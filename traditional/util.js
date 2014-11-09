div = function(a, b) {
    return Math.floor(a/b);
};

divMod = function(n, d) {
    var divisor = div(n, d);
    var mod = n - (d * divisor);
    return [divisor, mod];
};
