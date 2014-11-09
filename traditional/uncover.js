directions =
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

// breaks a targeted board into a bunch of tinier targeted boards.
decomposeBoard = function (targetBoard) {
    rowT = targetBoard.target.position[0];
    colT = targetBoard.target.position[1];
    // zero position
    rowZ = targetBoard.rows[0].cells[0].position[0];
    colZ = targetBoard.rows[0].cells[0].position[1];

    above = rowT - rowZ;
    below = targetBoard.height - (rowT - rowZ) - 1;
    left = colT - colZ;
    right = targetBoard.width - (colT - colZ) - 1;

    // N: the column of cells above the target.
    delN = [];
    for (i = 0; i < above; i++) {
        delN.push({cells: [targetBoard.rows[i].cells[colT - colZ]]});
    }
    boardN = {
        rows: delN,
        height: above,
        width: 1,
        target: null,
    };
    if (above > 0) {
        boardN.target = delN[above - 1].cells[0];
    };
    // NE: the matrix ne of the target.
    delNE = [];
    if (right > 0) {
        start = colT - colZ + 1;
        for (i = 0; i < above; i++) {
            cells = targetBoard.rows[i].cells.slice(start, start + right);
            delNE.push({cells: cells});
        }
    }
    boardNE = {
        rows: delNE,
        height: above,
        width: right,
        target: null,
    };
    if (above > 0 && right > 0) {
        boardNE.target = delNE[above - 1].cells[0];
    }
    // E: the row of cells to the right of the target.
    delE = [];
    if (right > 0) {
        start = colT - colZ + 1;
        delE = [{
            cells: targetBoard.rows[rowT-rowZ].cells.slice(start, start+right)
        }];
    }
    boardE = {
        rows: delE,
        height: 1,
        width: right,
        target: null,
    };
    if (right > 0) {
        boardE.target = delE[0].cells[0];
    }
    // SE: the matrix se of the target.
    delSE = [];
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
    boardSE = {
        rows: delSE,
        height: below,
        width: right,
        target: null,
    };
    if (right > 0 && below > 0) {
        boardSE.target = delSE[0].cells[0];
    }
    // S: the column of cells below the target.
    delS = [];
    for (i = 0; i < below; i++) {
        delS.push({cells: [targetBoard
            .rows[rowT - rowZ + i + 1]
            .cells[colT - colZ]]});
    }
    boardS = {
        rows: delS,
        height: below,
        width: 1,
        target: null,
    };
    if (below > 0) {
        boardS.target = delS[0].cells[0];
    }
    // SW: the matrix sw of the target.
    delSW = [];
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
    boardSW = {
        rows: delSW,
        height: below,
        width: left,
        target: null,
    };
    if (below > 0 && left > 0) {
        boardSW.target = delSW[0].cells[left - 1];
    }
    // W: the row of cells to the left of the target.
    delW = [];
    if (left > 0) {
        end = colT - colZ;
        delW = [{
            cells: targetBoard.rows[rowT - rowZ].cells.slice(0, end)
        }];
    }
    boardW = {
        rows: delW,
        height: 1,
        width: left,
        target: null,
    };
    if (left > 0) {
        boardW.target = delW[0].cells[left - 1];
    }
    // NW: the matrix of cells nw of the target.
    delNW = [];
    if (left > 0) {
        end = colT - colZ;
        for (i = 0; i < above; i++) {
            cells = targetBoard.rows[i].cells.slice(0, end);
            delNW.push({cells: cells});
        }
    }
    boardNW = {
        rows: delNW,
        height: above,
        width: left,
        target: null,
    };
    if (above > 0 && left > 0) {
        boardNW.target = delNW[above - 1].cells[left - 1];
    }

    return [boardN, boardNE, boardE, boardSE, boardS, boardSW, boardW, boardNW];
};

/* Modifies board in place. Returns number of uncovered cells. */
uncoverCascade = function (direction, targetedBoard) {

    // Board boundary condition
    if (targetedBoard.target === null) {
        return 0;
    }

    targetedBoard.target.covered = false;
    numUncovered = 1;

    // End condition of the cascade
    if (targetedBoard.target.numNeighbors !== 0) {
        return numUncovered;
    }

    segments = decomposeBoard(targetedBoard);
    interestingDirections = [];
    interestingSegments = [];
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
            interestingSegments = segments.slice(2,1);
            break;
        case "SE":
            interestingDirections = ["E", "SE", "S"];
            interestingSegments = segments.slice(2,3);
            break;
        case "S":
            interestingDirections = ["S"];
            interestingSegments = segments.slice(4,1);
            break;
        case "SW":
            interestingDirections = ["S", "SW", "W"];
            interestingSegments = segments.slice(4,3);
            break;
        case "W":
            interestingDirections = ["W"];
            interestingSegments = segments.slice(6,1);
            break;
        case "NW":
            interestingDirections = ["W", "NW", "N"];
            interestingSegments = segments.slice(6,2).concat([segments[0]]);
            break;
    }
    results = zip(uncoverCascade, interestingDirections, interestingSegments);
    numUncovered += results.reduce(function(a,b) { return a + b });
    return numUncovered;
};
