import {Position} from './position';
import Graphics = PIXI.Graphics;
import {CONFIG} from './config';
import {Person} from './person';
import {Perlin} from "./noise";

export class World {
    private _world: Position[][];
    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width % 2 === 0 ? width : width + 1;
        this._height = height % 2 === 0 ? height : height + 1;
    }

    public setupWorld() {
        // generate 2d array
        const world = Array.apply(null, Array<Position[]>(this._width));
        world.forEach((col, colIndex) => {
            world[colIndex] = Array.apply(null, Array<Position>(this._height));
            world[colIndex].forEach((c, rowIndex) => {
                world[colIndex][rowIndex] = {
                    water: Perlin(),
                    person: null,
                    changed: true,
                }
            })
        });
        this._world = world;
        // generate water
        this._world.forEach((col, colIndex) => {
            this._world[colIndex].forEach((c, rowIndex) => {
                const corner = [
                    this.getPosition(colIndex + 1, rowIndex),
                    this.getPosition(colIndex, rowIndex + 1),
                    this.getPosition(colIndex - 1, rowIndex),
                    this.getPosition(colIndex, rowIndex - 1),
                ];
                const posotion = this.getPosition(colIndex, rowIndex);
                posotion.water = Math.random() < (corner.some(_ => !_.water) ? 0.15 : 0.6)
            })
        });
        // smooth
        this._world.forEach((col, colIndex) => {
            this._world[colIndex].forEach((c, rowIndex) => {
                const corner = [
                    this.getPosition(colIndex + 1, rowIndex),
                    this.getPosition(colIndex, rowIndex + 1),
                    this.getPosition(colIndex - 1, rowIndex),
                    this.getPosition(colIndex, rowIndex - 1),
                ];
                const posotion = this.getPosition(colIndex, rowIndex);
                if (posotion.water && !corner.some(_ => _.water)) {
                    posotion.water = false;
                } else if (!posotion.water && !corner.some(_ => !_.water)) {
                    posotion.water = true;
                }
            })
        });
    }

    public getPosition(x, y): Position {
        x = x < 0 ? this._width + x : x % this._width;
        y = y < 0 ? this._height + y : y % this._height;
        return this._world[x][y];
    }

    public findRandomPosForPerson(): PIXI.Point {
        let point = null;
        while (!point) {
            const randomX = Math.floor(Math.random() * this._width);
            const randomY = Math.floor(Math.random() * this._height);
            const worldPositon = this._world[randomX][randomY];
            if (!worldPositon.water && !worldPositon.person) {
                point = new PIXI.Point(randomX, randomY);
            }
        }
        return point;
    }

    public addPerson(person: Person) {
        const worldPosition = this.getPosition(person.point.x, person.point.y);
        if (worldPosition.person) {
            throw new Error('Cannot add person to existing person!')
        }
        if (worldPosition.water) {
            throw new Error('Cannot add person to water!')
        }
        worldPosition.person = person;
        worldPosition.changed = true;
    }

    public movePerson(oldPoint: PIXI.Point, newPoint: PIXI.Point | null) {
        let worldPosition = this.getPosition(oldPoint.x, oldPoint.y);
        let newWorldPosition = null;
        if (!worldPosition.person) {
            throw new Error('Cannot move non existing person!');
        }
        if (newPoint) {
            newWorldPosition = this.getPosition(newPoint.x, newPoint.y);
            if (newWorldPosition.person) {
                throw new Error('Cannot move to existing person!');
            } else if (newWorldPosition.water) {
                throw new Error('Cannot move to water!');
            }
        }

        const person = worldPosition.person;
        worldPosition.person = null;
        if (newWorldPosition) {
            this.getPosition(newPoint.x, newPoint.y).person = person;
            newWorldPosition.changed = true;
        }
        worldPosition.changed = true;
    }

    public drawWorld(stage: PIXI.Container) {
        let strength = 0;
        let cells = 0;
        this._world.forEach((col: Position[], colIndex: number) => {
            col.forEach((cell: Position, rowIndex: number) => {
                if (cell.changed && Math.random() < 0.5) {
                    stage.addChild(this.getCellRect(cell, colIndex, rowIndex));
                    cells++;
                    cell.changed = false;
                }
            })
        });
        console.log(cells)
        return stage;
    }

    private getCellRect(pos: Position, x: number, y: number): PIXI.Graphics {
        const rect = new Graphics();
        if (pos.water) {
            rect.beginFill(0x0000FF)
        } else if (!pos.person) {
            rect.beginFill(0x00FF00)
        } else {
            rect.beginFill(pos.person.color)
        }
        const alpha = 0;
        rect.lineStyle(4, 0xff00000, alpha);
        rect.drawRect(x * CONFIG.CELL_SIZE, y * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        rect.endFill()
        return rect;
    }

    public constrainPointToWorld(x, y): PIXI.Point {
        return new PIXI.Point(x % this._width, y % this._height);
    }
}