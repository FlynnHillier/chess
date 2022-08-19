import { Piece,Species,Coordinate,Vector,PathingCharacteristics } from "./types";
import BlankPiece from "./piece";

export class Queen extends BlankPiece implements Piece {
    species: Species = "queen"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:-1,
        vectors:[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }

}

export default Queen