import { Piece, Species,Vector } from "./types";
import BlankPiece from "./piece";

export class King extends BlankPiece implements Piece {
    species: Species = "king"
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:1,
        vectors:[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:true,
    }
}

export default King