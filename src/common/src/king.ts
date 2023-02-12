import { PathingCharacteristics, Piece, Species,Vector } from "./types";
import BlankPiece from "./piece";

export class King extends BlankPiece implements Piece {
    species: Species = "king"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:1,
        vectors:[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:true,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }
}

export default King