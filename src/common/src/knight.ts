import { Piece, Species, Vector } from "./types";
import BlankPiece from "./piece";

export class Knight extends BlankPiece implements Piece {
    species: Species = "knight"

    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:1,
        vectors:[[2,1],[2,-1],[1,2],[-1,2],[1,2],[-1,-2],[1,-2],[-2,1],[-2,-1]],
        isOnlyMovableToSafeTiles:false,
    }
}

export default Knight