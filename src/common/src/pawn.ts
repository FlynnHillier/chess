import { Piece,Species,Coordinate,Vector, PathingCharacteristics } from "./types";
import BlankPiece from "./piece";

export class Pawn extends BlankPiece implements Piece {
    species: Species = "pawn"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:1,
        vectors:[{vector:[0,-1],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true}},{vector:[1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true}},{vector:[-1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true}},{vector:[0,-2],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,isOnlyMovableFromOriginalLocation:true}}],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }

}

export default Pawn