type Coords = { x: number; y: number };

enum MazeCell {
    Empty = 0,
    Wall = 1,
    Entrance = 2,
    Exit = 3,
}

type MazeRow = MazeCell[];

type MazeSolution = Coords[];

class Maze {
    rows: MazeRow[];

    private _startCoords?: Coords;
    private _solution?: MazeSolution;

    constructor(schema: string) {
        if (!Maze.validateMazeSchema(schema)) {
            throw new Error("Invalid maze schema");
        }

        const mapCellSchemaToMaze = {
            X: MazeCell.Wall,
            " ": MazeCell.Empty,
            I: MazeCell.Entrance,
            O: MazeCell.Exit,
        };

        this.rows = schema
            .split("\n")
            .filter(Boolean)
            .map((rowString) =>
                rowString
                    .trim()
                    .split("")
                    .map(
                        (cellString) =>
                            mapCellSchemaToMaze[cellString as keyof typeof mapCellSchemaToMaze]
                    )
            );
    }

    get solution(): MazeSolution | undefined {
        if (!Maze.isMaze(maze)) {
            throw new Error("Invalid maze");
        }

        const currentCoords = maze.startCoords;
        console.log(`Start position: ${currentCoords}`);

        const solution: MazeSolution = [];

        do {
            // get possible directions
            // according to prev direction make step (by direction priority)
            // add step to solution
            // optimize solution to drop dead ends
        } while (maze.cell(currentCoords) === MazeCell.Empty);

        return maze.cell(currentCoords) === MazeCell.Exit ? solution : undefined;
    }

    get startCoords(): Coords {
        if (this._startCoords) {
            return this._startCoords;
        }

        this._startCoords = this.rows.reduce<Coords | undefined>((result, row, rowIndex) => {
            if (result) return result;

            if (rowIndex === 0 || rowIndex === row.length - 1) {
                const cellIndex = row.findIndex((cell) => cell === MazeCell.Entrance);
                return cellIndex === -1 ? undefined : { x: cellIndex, y: rowIndex };
            }

            if (row[0] === MazeCell.Entrance) return { x: 0, y: rowIndex };

            if (row[row.length - 1] === MazeCell.Entrance)
                return { x: row.length - 1, y: rowIndex };
        }, undefined);

        return this._startCoords;
    }

    cell(coords: Coords) {
        return this.rows[coords.y][coords.x];
    }

    static isMaze(maze: unknown): maze is Maze {
        return (
            Array.isArray((maze as Maze).rows) &&
            (maze as Maze).rows.every(
                (row) =>
                    Array.isArray(row) &&
                    row.every((cell) => Object.values(MazeCell).includes(cell))
            )
        );
    }

    static validateMazeSchema(schema: unknown): boolean {
        // TODO: Implement maze schema validation
        // Maze is surrounded by wall
        // Entrance and exit are on the maze border
        // Entrance and exit are not blocked
        return true;
    }
}

const mazeSchema = `
XXXIXXXXXXXXXX
X            X
X X X XXXXX XX
X X X XX XX XX
X X X X   XXXX
X XXX XX XXXXX
XXX         XX
XX  XXXX    XX
X  XX XX     X
X XX      XX X
X XXXXXXX XX X
X      XX XX X  
XXXXXX XX  X X
XXXXXXXXXXOXXX
`;

const maze = new Maze(mazeSchema);
console.log(mazeSchema);
console.log("solution: ", maze.solution);
