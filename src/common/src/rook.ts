import { Piece,Species,Vector } from "./types";
import BlankPiece from "./piece";

export class Rook extends BlankPiece implements Piece {
    species: Species = "rook"
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:-1,
        vectors:[[1,0],[0,1],[-1,0],[0,-1]],
        isOnlyMovableToSafeTiles:false,
    }
}

export default Rook