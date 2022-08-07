import { Piece,Species,Coordinate,Vector } from "./types";
import BlankPiece from "./piece";

export class Queen extends BlankPiece implements Piece {
    species: Species = "queen"
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:-1,
        vectors:[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]],
        isOnlyMovableToSafeTiles:false,
    }
}

export default Queen