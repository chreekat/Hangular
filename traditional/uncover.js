var directions =
    [ "N"
    , "NE"
    , "E"
    , "SE"
    , "S"
    , "SW"
    , "W"
    , "NW"
    ];

zip = function (fn, as, bs) {
    ret = [];
    for (i = 0; i < Math.min(as.length, bs.length); i ++) {
        ret.push(fn(as[i], bs[i]));
    }
    return ret;
};

mkBoard = function (rows, height, width) {
    return {
        rows: rows,
        height: height,
        width: width,
        target: null
    };
};
// breaks a targeted board into a bunch of tinier targeted boards.
decomposeBoard = function (targetBoard) {
    var rowT = targetBoard.target.position[0];
    var colT = targetBoard.target.position[1];
    // zero position
    var rowZ = targetBoard.rows[0].cells[0].position[0];
    var colZ = targetBoard.rows[0].cells[0].position[1];

    var above = rowT - rowZ;
    var below = targetBoard.height - (rowT - rowZ) - 1;
    var left = colT - colZ;
    var right = targetBoard.width - (colT - colZ) - 1;

    // N: the column of cells above the target.
    var delN = [];
    for (i = 0; i < above; i++) {
        delN.push({cells: [targetBoard.rows[i].cells[colT - colZ]]});
    }
    var boardN = mkBoard(delN, above, 1);
    if (above > 0) {
        boardN.target = delN[above - 1].cells[0];
    };
    // NE: the matrix ne of the target.
    var delNE = [];
    if (right > 0) {
        start = colT - colZ + 1;
        for (i = 0; i < above; i++) {
            cells = targetBoard.rows[i].cells.slice(start, start + right);
            delNE.push({cells: cells});
        }
    }
    var boardNE = mkBoard(delNE, above, right);
    if (above > 0 && right > 0) {
        boardNE.target = delNE[above - 1].cells[0];
    }
    // E: the row of cells to the right of the target.
    var delE = [];
    if (right > 0) {
        start = colT - colZ + 1;
        delE = [{
            cells: targetBoard.rows[rowT-rowZ].cells.slice(start, start+right)
        }];
    }
    var boardE = mkBoard(delE, 1, right);
    if (right > 0) {
        boardE.target = delE[0].cells[0];
    }
    // SE: the matrix se of the target.
    var delSE = [];
    if (right > 0) {
        start = colT - colZ + 1;
        for (i = 0; i < below; i++) {
            cells = targetBoard
                .rows[rowT - rowZ + i + 1]
                .cells
                .slice(start, start + right);
            delSE.push({cells: cells});
        }
    }
    var boardSE = mkBoard(delSE, below, right);
    if (right > 0 && below > 0) {
        boardSE.target = delSE[0].cells[0];
    }
    // S: the column of cells below the target.
    var delS = [];
    for (i = 0; i < below; i++) {
        delS.push({cells: [targetBoard
            .rows[rowT - rowZ + i + 1]
            .cells[colT - colZ]]});
    }
    var boardS = mkBoard(delS, below, 1);
    if (below > 0) {
        boardS.target = delS[0].cells[0];
    }
    // SW: the matrix sw of the target.
    var delSW = [];
    if (left > 0) {
        end = colT - colZ;
        for (i = 0; i < below; i++) {
            cells = targetBoard
                .rows[rowT - rowZ + i + 1]
                .cells
                .slice(0, end);
            delSW.push({cells: cells});
        }
    }
    var boardSW = mkBoard(delSW, below, left);
    if (below > 0 && left > 0) {
        boardSW.target = delSW[0].cells[left - 1];
    }
    // W: the row of cells to the left of the target.
    var delW = [];
    if (left > 0) {
        end = colT - colZ;
        delW = [{
            cells: targetBoard.rows[rowT - rowZ].cells.slice(0, end)
        }];
    }
    var boardW = mkBoard(delW, 1, left);
    if (left > 0) {
        boardW.target = delW[0].cells[left - 1];
    }
    // NW: the matrix of cells nw of the target.
    var delNW = [];
    if (left > 0) {
        end = colT - colZ;
        for (i = 0; i < above; i++) {
            cells = targetBoard.rows[i].cells.slice(0, end);
            delNW.push({cells: cells});
        }
    }
    var boardNW = mkBoard(delNW, above, left);
    if (above > 0 && left > 0) {
        boardNW.target = delNW[above - 1].cells[left - 1];
    }

    return [boardN, boardNE, boardE, boardSE, boardS, boardSW, boardW, boardNW];
};

/* Modifies board in place. Returns number of uncovered cells. */
uncoverCascade = function (direction, targetedBoard) {

    var numUncovered = 0;

    // Board boundary condition
    if (targetedBoard.target === null) {
        return numUncovered;
    }

    targetedBoard.target.covered = false;
    numUncovered = 1;

    // Empty-area boundary condition
    if (targetedBoard.target.numNeighbors !== 0) {
        return numUncovered;
    }

    var segments = decomposeBoard(targetedBoard);
    var interestingDirections = [];
    var interestingSegments = [];
    switch (direction) {
        case "All":
            interestingDirections = directions;
            interestingSegments = segments;
            break;
        case "N":
            interestingDirections = ["N"];
            interestingSegments = segments.slice(0,1);
            break;
        case "NE":
            interestingDirections = ["N", "NE", "E"];
            interestingSegments = segments.slice(0,3);
            break;
        case "E":
            interestingDirections = ["E"];
            interestingSegments = segments.slice(2,3);
            break;
        case "SE":
            interestingDirections = ["E", "SE", "S"];
            interestingSegments = segments.slice(2,5);
            break;
        case "S":
            interestingDirections = ["S"];
            interestingSegments = segments.slice(4,5);
            break;
        case "SW":
            interestingDirections = ["S", "SW", "W"];
            interestingSegments = segments.slice(4,7);
            break;
        case "W":
            interestingDirections = ["W"];
            interestingSegments = segments.slice(6,7);
            break;
        case "NW":
            interestingDirections = ["W", "NW", "N"];
            interestingSegments = segments.slice(6,8).concat([segments[0]]);
            break;
    }
    var results = zip(uncoverCascade, interestingDirections, interestingSegments);
    numUncovered += results.reduce(function(a,b) { return a + b }, 0);
    return numUncovered;
};
