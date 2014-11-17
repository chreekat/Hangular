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

    genGameBoard = function (size) {
        var h, w, numMice;
        switch (size) {
            case "small":
                h = 9;
                w = 9;
                numMice = 10;
                break;
            case "medium":
                h = 16;
                w = 16;
                numMice = 40;
                break;
            case "large":
                h = 16;
                w = 30;
                numMice = 99;
                break;
            default:
                throw("Unknown board size: " + size);
        }
        var gameBoard = {
            rows: [],
            height: h,
            width: w,
            numMice: numMice,
        };
        var Cell = function (props) {
            this.covered = props.covered;
            this.numNeighbors = props.numNeighbors;
            this.musen = props.musen;
            this.position = props.position;
        };
        Cell.prototype.neighborsMap = function (f) {
            var x = this.position[0], y = this.position[1];
            var results = [];
            // left-right and up-down
            for (lr = -1; lr < 2; lr++) {
                for (ud = -1; ud < 2; ud++) {
                    if ((lr != 0 || ud != 0)  // don't process ourself
                            && (ud + x >= 0 && ud + x < gameBoard.height)
                            && (lr + y >= 0 && lr + y < gameBoard.width))
                    {
                        results.push(f(gameBoard.rows[ud + x].cells[lr + y]));
                    }
                }
            }
            return results;
        };

        var maxLoc = h * w;
        for (i = 0; i < h; i++) {
            var row = [];
            for (j = 0; j < w; j++) {
                row.push(new Cell({
                    covered: true,
                    numNeighbors: 0,
                    musen: false,
                    position: [i,j],
                }));
            }
            gameBoard.rows.push({cells: row});
        }

        var n = 0;
        while (n < numMice) {
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
