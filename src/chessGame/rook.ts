import { Piece } from "./types";
import BlankPiece from "./piece";

class Rook extends BlankPiece implements Piece {
    updateVision(): void {
        this.movableTo = this._walk([1,0]).concat(this._walk([0,1])).concat(this._walk([-1,0])).concat(this._walk([0,-1]))
    }   
}

export default Rook