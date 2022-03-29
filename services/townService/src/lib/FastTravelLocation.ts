import CoveyTownController from './CoveyTownController';
import { CoveyTownList } from '../CoveyTypes';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import CoveyTownListener from '../types/CoveyTownListener';
import { BoundingBox } from '../client/TownsServiceClient';

/**
 * The FastTravelLocation implements the logic for each fast travel location: managing the various events that
 * can occur (e.g. generate a fast travel location(FTL), or delete a FTL)
 */
export default class FastTravelLocation {

  get capacity(): number {
    return this._capacity;
  }

  get players(): Player[] {
    return this._players;
  }

  get FTLName(): string {
    return this._FTLName;
  }

  get isFullyOccupied(): boolean {
      return this._isFullyOccupied;
  }

  //   Prob need a list unaccessable of location?
  //   get isValidLocation(): boolean {
  //       return this._isValidLocation;
  //   }


  /** The list of players currently in the FTL * */
  private _players: Player[] = [];

  private _FTLName: string;

  private _isFullyOccupied: boolean;

  private _capacity: number;

  constructor(FTLName: string) {
    this._capacity = 10;            // some random magic number
    this._isFullyOccupied = false;  // not fully occupied by default 
    this._FTLName = FTLName;
  }

}