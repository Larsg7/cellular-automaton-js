import { CONFIG } from './config';

export class Person {
  set strength(value: number) {
    this._strength = value;
  }
  set reproduction(value: number) {
    this._reproduction = value;
  }
  private _strength: number;
  private _age: number;
  private _reproduction: number;
  private _colonyId: number;
  private _dead: boolean;
  private _point: PIXI.Point;
  private _color: number;

  constructor(colonyId: number, x, y, color: number) {
    this._strength = CONFIG.INITIAL_STRENGTH;
    this._age = 0;
    this._colonyId = colonyId;
    this._dead = false;
    this._reproduction = 0;
    this._point = new PIXI.Point(x, y);
    this._color = color;
  }

  oneStep() {
    this._age++;
    this._reproduction++;
    this._strength *= 0.95;
  }

  die() {
    this._dead = true;
  }

  mutate() {
    this._strength += Math.random() < 0.5 ? 1 : -1;
  }

  wonFight() {
    this._strength *= 1.05;
  }

  get dead(): boolean {
    return this._dead || this._age > CONFIG.MAX_AGE;
  }

  get strength(): number {
    return this._strength;
  }

  get age(): number {
    return this._age;
  }

  get colonyId(): number {
    return this._colonyId;
  }

  get reproduction(): number {
    return this._reproduction;
  }

  get color(): number {
    return this._color;
  }

  get point(): PIXI.Point {
    return this._point;
  }

  set point(value: PIXI.Point) {
    this._point = value;
  }
}