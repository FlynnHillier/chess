import { Piece } from "./types";
import BlankPiece from "./piece";

class Bishop extends BlankPiece implements Piece {
    updateVision(): void {
        this.movableTo = 
        this._walk([1,1])
        .concat(this._walk([1,-1]))
        .concat(this._walk([-1,-1]))
        .concat(this._walk([-1,1]))
    }   
}

export default Bishop