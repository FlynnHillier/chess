import { Piece,Species } from "./types";
import BlankPiece from "./piece";

class Queen extends BlankPiece implements Piece {
    species: Species = "queen"

    updateVision(): void {
        this.movableTo = 
        this._walk([1,0])
        .concat(this._walk([0,1]))
        .concat(this._walk([-1,0]))
        .concat(this._walk([0,-1]))
        .concat(this._walk([1,1]))
        .concat(this._walk([1,-1]))
        .concat(this._walk([-1,-1]))
        .concat(this._walk([-1,1]))
    }   
}

export default Queen