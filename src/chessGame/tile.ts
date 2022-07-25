import { Piece, Tile } from "./types";

class TileObject implements Tile {
    inVisionOf: Piece[] = []

    constructor(public occupant: null | Piece){}

    onInVisionOf(piece: Piece): void {
        if(!this.inVisionOf.includes(piece)){
            this.inVisionOf.push(piece)
        }
    }
}


export default TileObject