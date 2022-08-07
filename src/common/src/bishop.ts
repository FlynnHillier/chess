import { Piece,Species,Vector } from "./types";
import BlankPiece from "./piece";

export class Bishop extends BlankPiece implements Piece {
    species: Species = "bishop"
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:-1,
        vectors:[[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:false,
    }
}

export default Bishop