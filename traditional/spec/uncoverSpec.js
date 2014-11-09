describe("decomposeBoard", function () {
    it("makes the right targets", function () {
        rows = genGameBoard(9,9,10);
        targetBoard =  { rows: rows, target: rows[3].cells[2], width: 9, height: 9 };
        x = decomposeBoard(targetBoard);
        posns = x.map(function (tb) { return tb.target.position });
        expect(posns).toEqual([
            [2, 2],
            [2, 3],
            [3, 3],
            [4, 3],
            [4, 2],
            [4, 1],
            [3, 1],
            [2, 1]
            ]);
    });
});
