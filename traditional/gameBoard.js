GameBoard = (function () {
    set = function (gameBoard, loc) {
        var x = loc[0], y = loc[1];
        gameBoard.rows[x].cells[y].musen = true;
        // left-right and up-down
        for (lr = -1; lr < 2; lr++) {
            for (ud = -1; ud < 2; ud++) {
                if ((lr != 0 || ud != 0)  // don't process ourself
                        && (ud + x >= 0 && ud + x < gameBoard.height)
                        && (lr + y >= 0 && lr + y < gameBoard.width))
                {
                    gameBoard.rows[ud + x].cells[lr + y].numNeighbors++;
                }
            }
        }
    };

    unset = function (gameBoard, loc) {
        var x = loc[0], y = loc[1];
        gameBoard.rows[x].cells[y].musen = false;
        // left-right and up-down
        for (lr = -1; lr < 2; lr++) {
            for (ud = -1; ud < 2; ud++) {
                if ((lr != 0 || ud != 0)  // don't process ourself
                        && (ud + x >= 0 && ud + x < gameBoard.height)
                        && (lr + y >= 0 && lr + y < gameBoard.width))
                {
                    gameBoard.rows[ud + x].cells[lr + y].numNeighbors--;
                }
            }
        }
    };

    genGameBoard = function (h, w, numMus) {
        if (numMus > h*w) {
            throw("Impossible game board: more mus than tiles!");
        }
        var gameBoard = {
            rows: [],
            height: h,
            width: w,
        };
        var maxLoc = h * w;
        for (i = 0; i < h; i++) {
            var row = [];
            for (j = 0; j < w; j++) {
                row.push({
                    covered: true,
                    numNeighbors: 0,
                    musen: false,
                    position: [i,j],
                });
            }
            gameBoard.rows.push({cells: row});
        }

        var n = 0;
        while (n < numMus) {
            loc = divMod(Math.floor(Math.random() * maxLoc), w);
            if (! gameBoard.rows[loc[0]].cells[loc[1]].musen) {
                set(gameBoard, loc);
                n++;
            }
        }

        return gameBoard;
    };

    hideMouse = function (gameBoard, cell) {
        var loc = cell.position;
        unset(gameBoard, loc);
        for (i = 0; i < gameBoard.height; i++) {
            for (j = 0; j < gameBoard.width; j++) {
                // Goat's blood on the mantle
                if (i == loc[0] && j == loc[1]) {
                    continue;
                }
                var cell = gameBoard.rows[i].cells[j];
                if (!cell.musen) {
                    set(gameBoard, [i,j]);
                    return;
                }
            }
        }
    };

    return {
        genGameBoard: genGameBoard,
        hideMouse: hideMouse,
    };

}());
