genGameBoard = function (h, w, numMus) {
    if (numMus > h*w) {
        throw("Impossible game board: more mus than tiles!");
    }
    var cells = [];
    var maxLoc = h * w;
    for (i = 0; i < maxLoc; i++) {
        cells[i] = {
            covered: true,
            numNeighbors: 0,
            musen: false,
            position: divMod(i, w),
        };
    }

    set = function (loc) {
        cells[loc].musen = true;
        // left-right and up-down
        for (lr = -1; lr < 2; lr++) {
            for (ud = -1; ud < 2; ud++) {
                neighbor = loc + w*ud + lr;
                if ((lr != 0 || ud != 0)  // don't process ourself
                        && (div(loc, w) == div(loc+lr, w)) // don't wrap around
                        && ((neighbor >= 0 && neighbor < maxLoc)))    // don't fall off board
                {
                    cells[neighbor].numNeighbors++;
                }
            }
        }
    };

    var n = 0;
    while (n < numMus) {
        loc = Math.floor(Math.random() * maxLoc);
        if (! cells[loc].musen) {
            set(loc);
            n++;
        }
    }

    var rows = [];
    for (i = 0; i < h; i++) {
        rows[i] = { cells: cells.slice(i*w, i*w+w) };
    }

    return {
        rows: rows,
        width: w,
        height: h
    };
};
