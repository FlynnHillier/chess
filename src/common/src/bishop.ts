import { PathingCharacteristics, Piece,Species,Vector } from "./types";
import BlankPiece from "./piece";

export class Bishop extends BlankPiece implements Piece {
    species: Species = "bishop"
    _pathingCharacteristics: PathingCharacteristics = {
        steps:-1,
        vectors:[[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }
}

export default Bishop