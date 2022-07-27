import { Piece, Species } from "./types";
import BlankPiece from "./piece";

class Knight extends BlankPiece implements Piece {
    species: Species = "knight"

    updateVision(): void {
        this.movableTo = 
        this._walk([2,1],1)
        .concat(this._walk([2,-1],1))
        .concat(this._walk([1,2],1))
        .concat(this._walk([-1,2],1))
        .concat(this._walk([1,2],1))
        .concat(this._walk([-1,-2],1))
        .concat(this._walk([1,-2],1))
        .concat(this._walk([-2,1],1))
        .concat(this._walk([-2,-1],1))
    }   
}

export default Knight