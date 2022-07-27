import { Board,Perspective, Piece,Tile,Coordinate} from "./types"

import Bishop from "./bishop";
import TileObject from "./tile";


class ChessBoard implements Board {
    captured: { white: Piece[]; black: Piece[] } = {
        white:[],
        black:[]
    }
    tileMap: Tile[][] = []
    initialised = false




    constructor(public perspective:Perspective){}

    init(pieceMap?: (Piece | null)[][]) {
        if(!pieceMap){
            pieceMap = [
                [null,null,new Bishop(this,"white")],
                [null,null,null],
                [null,null,null]
            ]
        }


        let piecesForInit : Piece[] = []

        for(let row of pieceMap){ //populate this.tileMap
            this.tileMap.push([])
            for(let occupant of row){
                if(occupant !== null){
                    piecesForInit.push(occupant)
                }
                this.tileMap[pieceMap.indexOf(row)].push(new TileObject(occupant))
            }
        }

        for(let piece of piecesForInit){
            this._initialisePiece(piece)
        }

        this.initialised = true
    }


    _initialisePiece(piece:Piece) : void{
        piece.location = this._getPieceLocation(piece)
        piece.updateVision()
        piece.initialised = true
    }


    _getPieceLocation(piece:Piece) : [number,number]{
        for(let i = 0; i < this.tileMap.length;i++){
            const matchingTile = this.tileMap[i].find((tile)=>piece === tile.occupant)

            if(matchingTile){
                return [
                    this.tileMap[i].indexOf(matchingTile),
                    i
                ]
            }
        }

        throw {
            message:"on _getPieceLocation() could not locate piece within tileMap",
            piece:piece
        }
    }


    _ConcatUnique(array_one:Array<any>, array_two:Array<any>,exclude? : Array<any>){
        
        for(let elem of array_one){
            if(exclude?.includes(elem)){
                array_one.splice(array_one.indexOf(elem),1)
            }
        }
        for(let elem of array_two){
            if(exclude?.includes(elem)){
                continue
            }
            if(!array_one.includes(elem)){
                array_one.push(elem)
            }
        }
        return array_one
    }

    onPieceMove(piece: Piece,moveTo:Coordinate): void {
        let originTile = this.getTile(piece.location) as Tile
        let targetTile = this.getTile(moveTo)

        let excludeFromUpdate : Piece[] = [piece]

        originTile.occupant = null

        if(targetTile.occupant !== null){
            this.captured[piece.perspective].push(targetTile.occupant)
            targetTile.occupant.captured = true
            targetTile.occupant.location = [-1,-1]
            excludeFromUpdate.push(targetTile.occupant)
        }
        targetTile.occupant = piece

        const piecesForVisionUpdate =  this._ConcatUnique(targetTile.inVisionOf,originTile.inVisionOf,excludeFromUpdate)  //targetTile.inVisionOf.concat(originTile.inVisionOf)

        targetTile.inVisionOf = []
        originTile.inVisionOf = []

        for(let anotherPiece of piecesForVisionUpdate){ //updates vision of all affected tiles by the move at hand
            anotherPiece.updateVision()
        }

        piece.location = moveTo
        piece.updateVision()
    }


    tileDoesExist(location:Coordinate){
        return (location[1] >= 0 && location[1] < this.tileMap.length && location[0] >= 0 && location[0] < this.tileMap[0].length) //relies on all inside arrays being fixed same length, or will break.
    }

    getTile(location: Coordinate): Tile{
        return this.tileMap[location[1]][location[0]]
    }
}

export default ChessBoard