import  BoundingBox  from './BoundingBox';

/**
 * The FastTravelLocation implements the logic for each fast travel location: managing the various events that
 * can occur (e.g. generate a fast travel location(FTL), or delete a FTL)
 */
export default class FastTravelLocation {
  
  private _location: BoundingBox;
  
  private _FTLName: string;

  get FTLName(): string {
    return this._FTLName;
  }

  // Prob need a list unaccessable of location?
  get location(): BoundingBox {
    return this._location;
  }

  constructor(FTLName: string, location: BoundingBox) {
    this._location = location;
    this._FTLName = FTLName;
  }

  


}