import FastTravelLocation from "../../classes/FastTravelLocation";
import BoundingBox from "../../classes/BoundingBox";
import getFastTravelAreas from './FastTravelConstants'

describe('testValidFTL', () => {
    it('Should allow all different kinds of location', () => {
        const FTL0 = new FastTravelLocation('FTL0', new BoundingBox(0,0,0,0));
        const FTL1 = new FastTravelLocation('FTL1', new BoundingBox(1,1,-1,-1));
        const FTL2 = new FastTravelLocation('FTL1', new BoundingBox(1.5,1.5,0.5,0.5));
        const FTL3 = new FastTravelLocation('FTL1', new BoundingBox(99,-99,-99,99));
        expect(FTL0).toBeInstanceOf(FastTravelLocation);
        expect(FTL1).toBeInstanceOf(FastTravelLocation);
        expect(FTL2).toBeInstanceOf(FastTravelLocation);
        expect(FTL3).toBeInstanceOf(FastTravelLocation);
      
    });
  });

  describe('testGetFTL', () => {
    it('Should get all fast travel locations', () => {
        const FTLs = getFastTravelAreas();
        expect(FTLs).toHaveLength(9);
        expect(FTLs[0]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[1]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[2]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[3]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[4]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[5]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[6]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[7]).toBeInstanceOf(FastTravelLocation);
        expect(FTLs[8]).toBeInstanceOf(FastTravelLocation);
      
    });
  });