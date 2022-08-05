import { Board,Perspective, Piece,Tile,Coordinate} from "./types"
import TileObject from "./tile";

import Bishop from "./bishop";
import Rook from "./rook";

export class ChessBoard implements Board {
    captured: { white: Piece[]; black: Piece[] } = {
        white:[],
        black:[]
    }
    tileMap: Tile[] = []
    initialised = false
    rowLength = -1




    constructor(public perspective:Perspective){}

    init({pieceMap = [null,null,null,null,new Rook(this,"white"),null,null,null,null] ,tilesPerRow = 3} : {pieceMap?:(Piece | null)[],tilesPerRow?:number} = {}) {

        if(pieceMap.length % tilesPerRow !== 0){
            throw Error(`invalid pieceMap provided for rowLength of '${tilesPerRow}', pieceMap must be of a length that is an exact multiple of provided rowLength.`)
        }


        this.rowLength = tilesPerRow
        let piecesForInit : Piece[] = []

        for(let piece of pieceMap){
            if(piece !== null){
                piecesForInit.push(piece)
            }
            this.tileMap.push(new TileObject(piece))
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
        const matchingTile = this.tileMap.find((tile)=>piece === tile.occupant)

        if(!matchingTile){
            throw {
                message:"on _getPieceLocation() could not locate piece within tileMap",
                piece:piece
            }
        }

        const tileIndex = this.tileMap.indexOf(matchingTile)

        return this._indexToCoordinate(tileIndex)
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
        if(location[0] < 0 || location[1] < 0){
            return false
        }

        const index = this._coordinateToIndex(location)
        return (index >= 0 && index < this.tileMap.length) //relies on all inside arrays being fixed same length, or will break.
    }

    getTile(location: Coordinate): Tile{
        return this.tileMap[this._coordinateToIndex(location)]
    }

    _indexToCoordinate(index:number) : Coordinate {
        return [index % this.rowLength,Math.floor(index / this.rowLength)]
    }

    _coordinateToIndex(coordinate:Coordinate) : number {
        if(coordinate[0] < 0 || coordinate[1] < 0){
           throw Error(`cannot convert coordinate of negative indexes to a valid index: Coordinate: [${coordinate[0]},${coordinate[1]}] `)
        }

        return (coordinate[1] * this.rowLength) + coordinate[0]
    }
}

export default ChessBoard