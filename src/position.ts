import { Person } from './person';

export interface Position {
  water: boolean;
  person: Person;
  changed: boolean;
}