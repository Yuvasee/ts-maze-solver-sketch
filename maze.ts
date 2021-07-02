import { add, subtract } from "mathjs";

type Vector = [number, number];

enum Direction {
    Left,
    Down,
    Right,
    Up,
}

enum MazeCell {
    Empty,
    Wall,
    Entrance,
    Exit,
}

type MazeRow = MazeCell[];

type MazeSolution = Vector[];

const MAP_DIRECTION_TO_VECTOR: Record<Direction, Vector> = {
    [Direction.Left]: [-1, 0],
    [Direction.Down]: [0, 1],
    [Direction.Right]: [1, 0],
    [Direction.Up]: [0, -1],
};

function directionToVector(direction: Direction): Vector {
    return MAP_DIRECTION_TO_VECTOR[direction];
}

function vectorToDirection(vector: Vector): Direction {
    const direction = Object.entries(MAP_DIRECTION_TO_VECTOR).find(
        ([_direction, coords]) => coords[0] === vector[0] && coords[1] === vector[1]
    )?.[0];
    return direction === undefined ? undefined : Number(direction);
}

class Maze {
    rows: MazeRow[];

    private _startCoords?: Vector;

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

        let currentCoords = maze.startCoords;

        const solution: MazeSolution = [currentCoords];

        function leftWallFollowerNextStep(availableDirections: Direction[], prevVector: Vector) {
            const prevDirection = vectorToDirection(prevVector);
            const defaultDirectionsPriority = [
                Direction.Up,
                Direction.Left,
                Direction.Down,
                Direction.Right,
            ];
            const directionsPriority = defaultDirectionsPriority
                .slice(prevDirection)
                .concat(defaultDirectionsPriority.slice(0, prevDirection));
            const nextDirection = directionsPriority.find((direction) =>
                availableDirections.includes(direction)
            );
            return directionToVector(nextDirection);
        }

        do {
            console.log("Solution: ", solution);
            console.log("Coords: ", currentCoords);

            const directions = this.possibleDirections(currentCoords);
            console.log("Directions: ", directions);

            if (directions.length === 1) {
                currentCoords = add(currentCoords, directionToVector(directions[0])) as Vector;
            } else {
                const prevVector = subtract(currentCoords, solution[solution.length - 2]) as Vector;
                console.log("Prev vector: ", prevVector);
                const vector = leftWallFollowerNextStep(directions, prevVector);
                console.log("Vector: ", vector);
                currentCoords = add(currentCoords, vector) as Vector;
            }

            console.log("Coords: ", currentCoords);
            console.log("---");

            solution.push([...currentCoords]);
        } while (maze.cell(currentCoords) === MazeCell.Empty);

        // TODO: optimize solution to drop dead ends

        return maze.cell(currentCoords) === MazeCell.Exit ? solution : undefined;
    }

    get startCoords(): Vector {
        if (this._startCoords) {
            return this._startCoords;
        }

        this._startCoords = this.rows.reduce<Vector | undefined>((result, row, rowIndex) => {
            if (result) return result;

            if (rowIndex === 0 || rowIndex === row.length - 1) {
                const cellIndex = row.findIndex((cell) => cell === MazeCell.Entrance);
                return cellIndex === -1 ? undefined : [cellIndex, rowIndex];
            }

            if (row[0] === MazeCell.Entrance) return [0, rowIndex];

            if (row[row.length - 1] === MazeCell.Entrance) return [row.length - 1, rowIndex];
        }, undefined);

        return this._startCoords;
    }

    cell(coords: Vector): MazeCell | undefined {
        const { rows } = this;

        if (
            coords[0] < 0 ||
            coords[0] > rows[0].length - 1 ||
            coords[1] < 0 ||
            coords[1] > rows.length - 1
        ) {
            return undefined;
        }

        return rows[coords[1]][coords[0]];
    }

    possibleDirections(coords: Vector): Direction[] {
        const directions: Direction[] = [];

        Object.entries(MAP_DIRECTION_TO_VECTOR).map(([direction, vector]) => {
            const cell = this.cell(add(coords, vector) as Vector);
            if (cell !== undefined && cell !== MazeCell.Wall) {
                directions.push(Number(direction));
            }
        });

        return directions;
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
        // Min rows, cells
        // Rows are of equal length
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
