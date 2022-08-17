import { Board,Perspective, Piece,Tile,Coordinate} from "./types"
import TileObject from "./tile";

import Bishop from "./bishop";
import Rook from "./rook";

export class ChessBoard implements Board {
    captured: { white: Piece[]; black: Piece[] } = {
        white:[],
        black:[]
    }

    activePieces: Piece[] = []


    tileMap: Tile[] = []
    initialised = false
    rowLength = -1
    checkMated=false
    king : {white:Piece| null, black:Piece | null} = {
        white:null,
        black:null
    }
    forVisionUpdateOnEveryMove : Piece[] = [] 

    pinnedPieces: { white: Piece[] , black: Piece [] } = {
        white:[],
        black:[]
    }

    constructor(public perspective:Perspective){}

    init({pieceMap = [null,null,null,null,new Rook(this,"white"),null,null,null,null] ,tilesPerRow = 3} : {pieceMap?:(Piece | null)[],tilesPerRow?:number} = {}) {

        if(pieceMap.length % tilesPerRow !== 0){
            throw Error(`invalid pieceMap provided for rowLength of '${tilesPerRow}', pieceMap must be of a length that is an exact multiple of provided rowLength.`)
        }

        let kingPresence ={
            white:false,
            black:false
        }

        this.rowLength = tilesPerRow
        this.forVisionUpdateOnEveryMove = []

        let piecesForInit : Piece[] = []

        for(let piece of pieceMap){
            if(piece !== null){
                this.activePieces.push(piece)
                if(piece.species === "king"){
                    if(kingPresence[piece.perspective]){
                        throw Error(`invalid game setup - only one king per perspective is allowed. ${piece.perspective} perspective has more than one.`)
                    }
                    kingPresence[piece.perspective] = true
                    this.king[piece.perspective] = piece
                }
                piecesForInit.push(piece)
                if(piece._pathingCharacteristics.isOnlyMovableToSafeTiles){
                    this.forVisionUpdateOnEveryMove.push(piece)
                }
            }
            this.tileMap.push(new TileObject(piece))
        }

        if(!kingPresence.white || !kingPresence.black){
            throw Error(`invalid game setup - both perspectives must have a king.`)
        }

        for(let piece of piecesForInit){
            this._initialisePiece(piece)
        }

        for(let piece of this.forVisionUpdateOnEveryMove){
            this._initialisePiece(piece,{isSecondInit:true})
        }

        this.checkForPins()

        this.initialised = true
    }

    isCheck(){

    }


    checkForPins(){
        for(let piece of this.activePieces){
            const pinnedBy = piece.getPinnedBy()
            piece.pinnedBy = pinnedBy

            if(piece.pinnedBy.length !== 0){
                piece.isPinned = true
                piece.update()
            } else{
                if(piece.isPinned === true){
                    piece.isPinned = false
                    piece.update()
                }
            }
        }
    }

    _initialisePiece(piece:Piece,{isSecondInit = false}:{isSecondInit?:boolean} = {}) : void{
        piece.location = this._getPieceLocation(piece)
        piece.update()
        if(!(piece._pathingCharacteristics.isOnlyMovableToSafeTiles === true && isSecondInit === false)){
            piece.initialised = true
        }
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

        if(targetTile.occupant !== null){ //capture piece in target location
            excludeFromUpdate.push(targetTile.occupant)
            this.capturePiece(targetTile.occupant)
        }

        targetTile.occupant = piece //move to destination tile

        const piecesForUpdate : Piece[] =  this._ConcatUnique(targetTile.inVisionOf,originTile.inVisionOf,excludeFromUpdate)  //targetTile.inVisionOf.concat(originTile.inVisionOf)

        targetTile.inVisionOf = []
        originTile.inVisionOf = []

        piece.location = moveTo
        piece.update()

        for(let anotherPiece of piecesForUpdate){ //updates vision of all affected tiles by the move at hand
            anotherPiece.update()
        }

        this.updateMoveToSafeTileOnlyPieces()

        this.checkForPins()
    }

    capturePiece(piece:Piece){
        this.getTile(piece.location).occupant === null
        this.captured[piece.perspective === "white" ? "black" : "white"].push(piece)
        for(let location of piece.inVision){
            this.getTile(location).onNoLongerInVisionOf(piece)
        }

        this.activePieces.splice(this.activePieces.indexOf(piece),1)

        piece.onCaptured()
    }


    updateMoveToSafeTileOnlyPieces() : void{
        for (let piece of this.forVisionUpdateOnEveryMove){
            piece.update()
        }

        for (let piece of this.forVisionUpdateOnEveryMove){
            piece.update()
        }
    }



    tileIsInVisionOfPerspective(tile:Tile,perspective:Perspective) : boolean{
        for(let piece of tile.inVisionOf){
            if(piece.perspective === perspective){
                return true
            }
        }
        return false
    }

    tileDoesExist(location:Coordinate){
        if(location[0] < 0 || location[1] < 0){
            return false
        }

        return (location[0] < this.rowLength  && location[1] < Math.floor(this.tileMap.length / this.rowLength)) 
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