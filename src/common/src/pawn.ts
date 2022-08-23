import { Piece,Species,Coordinate,Vector, PathingCharacteristics } from "./types";
import BlankPiece from "./piece";

export class Pawn extends BlankPiece implements Piece {
    species: Species = "pawn"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:1,
        vectors:[
            //white
            {vector:[0,-1],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,existsOnlyForPerspective:"white",canCapture:false}},
            {vector:[1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"white"}},
            {vector:[-1,-1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"white"}},
            {vector:[0,-1],pathingCharacteristics:{steps:2,isOnlyMovableToEmptyTiles:true,isOnlyMovableFromOriginalLocation:true,existsOnlyForPerspective:"white",canCapture:false}},
            //black
            {vector:[0,1],pathingCharacteristics:{isOnlyMovableToEmptyTiles:true,existsOnlyForPerspective:"black",canCapture:false}},
            {vector:[1,1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"black"}},
            {vector:[-1,1],pathingCharacteristics:{isOnlyMovableToOccupiedTiles:true,existsOnlyForPerspective:"black"}},
            {vector:[0,1],pathingCharacteristics:{steps:2,isOnlyMovableToEmptyTiles:true,isOnlyMovableFromOriginalLocation:true,existsOnlyForPerspective:"black",canCapture:false}},
        ],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }

    canEnPassant: boolean = true
    canBeEnPassanted: boolean = true
}

export default Pawn