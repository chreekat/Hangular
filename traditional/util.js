div = function(a, b) {
    return Math.floor(a/b);
};

divMod = function(n, d) {
    divisor = div(n, d);
    mod = n - (d * divisor);
    return [divisor, mod];
};
