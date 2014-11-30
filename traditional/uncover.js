mkMkBoard = function (targetBoard) {
    var Board = function (row, col) {
        this.target = targetBoard.gameBoard.rows[row].cells[col];
    };
    Board.prototype = Object.create(targetBoard);

    return function(row, col) {
        return new Board(row, col);
    };
};

// Returns a list of targetBoards.
uncoverCascadeNeighbors = function (targetBoard) {
    var mkBoard = mkMkBoard(targetBoard);
    var row, col;
    var neighbors = [];
    row = targetBoard.target.position[0];
    col = targetBoard.target.position[1];
    if (row > 0) {
        if (col > 0) {
            neighbors.push(mkBoard(row - 1, col - 1));
        }
        neighbors.push(mkBoard(row - 1, col));
        if (col < targetBoard.gameBoard.width - 1) {
            neighbors.push(mkBoard(row - 1, col + 1));
        }
    }
    if (col > 0) {
        neighbors.push(mkBoard(row, col - 1));
    }
    if (col < targetBoard.gameBoard.width - 1) {
        neighbors.push(mkBoard(row, col + 1));
    }
    if (row < targetBoard.gameBoard.height - 1) {
        if (col > 0) {
            neighbors.push(mkBoard(row + 1, col - 1));
        }
        neighbors.push(mkBoard(row + 1, col));
        if (col < targetBoard.gameBoard.width - 1) {
            neighbors.push(mkBoard(row + 1, col + 1));
        }
    }
    return neighbors;
};

/* Modifies board in place. Returns number of uncovered cells. */
uncoverCascade = function (targetBoard) {
    var numUncovered = 0;
    if (targetBoard.target.covered) {
        targetBoard.target.covered = false;
        numUncovered = 1;
        if (targetBoard.target.numNeighbors === 0) {
            var neighbors = uncoverCascadeNeighbors(targetBoard);

            var results = neighbors.map(uncoverCascade);
            numUncovered += results.reduce(function(a,b) { return a + b }, 0);
        }
    }
    return numUncovered;
};
