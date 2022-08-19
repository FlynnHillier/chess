import { PathingCharacteristics, Piece, Species, Vector } from "./types";
import BlankPiece from "./piece";

export class Knight extends BlankPiece implements Piece {
    species: Species = "knight"

    _pathingCharacteristics: PathingCharacteristics = {
        steps:1,
        vectors:[[2,1],[2,-1],[1,2],[-1,2],[1,2],[-1,-2],[1,-2],[-2,1],[-2,-1]],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }
}

export default Knight