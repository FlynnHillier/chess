import { Perspective, Piece, Tile } from "./types";

class TileObject implements Tile {
    inVisionOf: Piece[] = []

    constructor(public occupant: null | Piece,public willUpgradePawns : false | Perspective = false){}

    onInVisionOf(piece: Piece): void {
        if(!this.inVisionOf.includes(piece)){
            this.inVisionOf.push(piece)
        }
    }

    onNoLongerInVisionOf(piece:Piece) : void {
        this.inVisionOf.splice(this.inVisionOf.indexOf(piece),1)
    }
}


export default TileObject