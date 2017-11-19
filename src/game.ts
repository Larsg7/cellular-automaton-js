import { CONFIG } from './config';
import { Person } from './person';
import { World } from './world';

export class Game {
  private _world: World;
  private _persons: Person[] = [];
  private _colors: number[] = [];

  constructor(width: number, height: number) {
    this._world = new World(width, height);
    this._world.setupWorld();
    this._colors = Array.apply(null, Array(CONFIG.NUM_CIVS));
    this._colors = this._colors.map(() => +('0x' + Math.floor(16777215 * Math.random()).toString(16)));
  }

  public setInitialPopulation() {
    for (let i = 0; i < CONFIG.NUM_CIVS; i++) {
      const point = this._world.findRandomPosForPerson();
      this.addPerson(i, point.x, point.y);
    }
  }

  private addPerson(colonyId, x, y) {
    const person = new Person(colonyId, x, y, this._colors[colonyId]);
    this._persons.push(person);
    this._world.addPerson(person);
    return person;
  }

  public run(stage: PIXI.Container) {
    this._persons.forEach(person => this.personStep(person));

    this._world.drawWorld(stage);
  }

  private personStep(person: Person) {
    const newPoint = this.findPointToMoveTo(person);
    if (newPoint) {
      const position = this._world.getPosition(newPoint.x, newPoint.y);
      if (!position.person) {
        if (person.reproduction > CONFIG.MAX_REPRODUCTION) {
          person.reproduction = 0;
          const newPerson = this.addPerson(person.colonyId, newPoint.x, newPoint.y);
          newPerson.strength = person.strength;
          newPerson.mutate();
          return;
        }
        this._world.movePerson(person.point, newPoint);
        person.point = newPoint;
      } else if (position.person.colonyId === person.colonyId) {
        return;
      } else if (position.person.strength > person.strength) {
        person.die();
        position.person.wonFight();
        return;
      } else if (position.person.strength < person.strength) {
        position.person.die();
        person.wonFight();
      }
      person.oneStep();
    }
    if (person.dead) {
      this.removePerson(person);
    }
  }

  private removePerson(person) {
    this._world.movePerson(person.point, null);
    const index = this._persons.findIndex(_ => _ === person);
    this._persons.splice(index, 1);
  }

  private findPointToMoveTo(person: Person): PIXI.Point {
    const point = person.point;
    const options = [
      new PIXI.Point(point.x + 1, point.y + 1),
      new PIXI.Point(point.x + 1, point.y),
      new PIXI.Point(point.x + 1, point.y - 1),
      new PIXI.Point(point.x, point.y - 1),
      new PIXI.Point(point.x - 1, point.y - 1),
      new PIXI.Point(point.x - 1, point.y),
      new PIXI.Point(point.x - 1, point.y + 1),
      new PIXI.Point(point.x, point.y + 1),
    ];
    const startIndex = Math.floor(Math.random() * 8 % 8);
    for (let i = 0; i < 8; i++) {
      const index = (startIndex + i) % 8;
      const newPoint = this._world.constrainPointToWorld(options[index].x, options[index].y);
      const position = this._world.getPosition(newPoint.x, newPoint.y);
      if (!position.water && !(position.person && position.person.colonyId === person.colonyId)) {
        return newPoint;
      }
    }
    return null;
  }
}