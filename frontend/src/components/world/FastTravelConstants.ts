import FastTravelLocation from "../../../../services/townService/src/lib/FastTravelLocation";
import BoundingBox from "../../classes/BoundingBox";

const TRICERATOPS_FTL = new FastTravelLocation('Triceratops', new BoundingBox(420, 225, 5, 5));
const ARMLESS_FTL = new FastTravelLocation('Armless Skeleton', new BoundingBox(1666, 500, 5, 5));
const VASES_FTL = new FastTravelLocation('Vase Room', new BoundingBox(850, 500, 5, 5));
const LEFT_FOYER_FTL = new FastTravelLocation('Left End of Foyer', new BoundingBox(330, 975, 5, 5));
const RIGHT_FOYER_FTL = new FastTravelLocation('Right End of Foyer', new BoundingBox(1845, 1000, 5, 5));
const CONFERENCE_HALL_FTL = new FastTravelLocation('Conference Hall', new BoundingBox(2170, 450, 5, 5));
const ATRIUM_ENTRANCE_FTL = new FastTravelLocation('Atrium Entrance', new BoundingBox(2700, 720, 5, 5));
const ATRIUM_BACK_FTL = new FastTravelLocation('Back of Atrium', new BoundingBox(3250, 420, 5, 5));
const BASEMENT_FTL = new FastTravelLocation('Basement', new BoundingBox(3130, 1200, 5, 5));

export default function getFastTravelAreas(): FastTravelLocation[] {
    return [TRICERATOPS_FTL, ARMLESS_FTL, VASES_FTL, 
        LEFT_FOYER_FTL, RIGHT_FOYER_FTL, CONFERENCE_HALL_FTL, 
        ATRIUM_ENTRANCE_FTL, ATRIUM_BACK_FTL, BASEMENT_FTL];
}