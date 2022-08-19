import { Piece,Species,Coordinate,Vector, PathingCharacteristics } from "./types";
import BlankPiece from "./piece";

export class Pawn extends BlankPiece implements Piece {
    species: Species = "pawn"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:1,
        vectors:[
            //white
            {vector:[0,-1],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,existsOnlyForPerspective:"white"}},
            {vector:[1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"white"}},
            {vector:[-1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"white"}},
            {vector:[0,-2],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,isOnlyMovableFromOriginalLocation:true,existsOnlyForPerspective:"white"}},
            //black
            {vector:[0,1],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,existsOnlyForPerspective:"black"}},
            {vector:[1,1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"black"}},
            {vector:[-1,1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"black"}},
            {vector:[0,2],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,isOnlyMovableFromOriginalLocation:true,existsOnlyForPerspective:"black"}},
        ],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }

}

export default Pawn