describe("uncoverCascadeNeighbors", function () {
    describe("does corners", function () {
        var rows = genGameBoard(2,2,1);
        var targetBoard =  { rows: rows, width: 2, height: 2 };
        it("00", function () {
            targetBoard.target = targetBoard.rows[0].cells[0];
            expect(uncoverCascadeNeighbors(targetBoard).length).toEqual(3);
        });
        it("01", function () {
            targetBoard.target = targetBoard.rows[0].cells[1];
            expect(uncoverCascadeNeighbors(targetBoard).length).toEqual(3);
        });
        it("10", function () {
            targetBoard.target = targetBoard.rows[1].cells[0];
            expect(uncoverCascadeNeighbors(targetBoard).length).toEqual(3);
        });
        it("11", function () {
            targetBoard.target = targetBoard.rows[1].cells[1];
            expect(uncoverCascadeNeighbors(targetBoard).length).toEqual(3);
        });
    });
});
