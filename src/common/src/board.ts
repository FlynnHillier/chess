import { Board,Perspective, Piece,Tile,Coordinate,CastleMoveSet} from "./types"
import TileObject from "./tile";

import Bishop from "./bishop";
import Rook from "./rook";
import Queen from "./queen";
import Knight from "./knight";
import King from "./king";
import Pawn from "./pawn";

export class ChessBoard implements Board {
    initialised = false
    tileMap: Tile[] = []
    rowLength = -1
    activePieces: Piece[] = []

    currentTurn : Perspective = "white"
    turnCount : number = 0

    forVisionUpdateOnEveryMove : Piece[] = []
    forUpdateOnNextMove : Piece[] = []

    checkInfo : { 
        white: { status: "none" | "check" | "checkmate"; threateningPieces: { piece: Piece; alongPath: Coordinate[]; }[]; }
        black:{ status: "none" | "check" | "checkmate"; threateningPieces: { piece: Piece; alongPath: Coordinate[]; }[]; }
    } = {
        white: { 
            status: "none", 
            threateningPieces: [] 
        },
        black: { 
            status: "none", 
            threateningPieces: [] 
        }
    }
    king : {white:Piece| null, black:Piece | null} = {
        white:null,
        black:null
    }
    captured: { white: Piece[]; black: Piece[] } = {
        white:[],
        black:[]
    }

    castleMoves : {
        white: CastleMoveSet[]
        black: CastleMoveSet[]
    } = {
        white:[],
        black:[]
    }



    constructor(public perspective:Perspective){}

    init({pieceMap = [
            new Rook(this,"black"),new Knight(this,"black"),new Bishop(this,"black"),new Queen(this,"black"),new King(this,"black"),new Bishop(this,"black"),new Knight(this,"black"), new Rook(this,"black"),
            new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"), new Pawn(this,"black"),
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null,
            new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"), new Pawn(this,"white"),
            new Rook(this,"white"),new Knight(this,"white"),new Bishop(this,"white"),new Queen(this,"white"),new King(this,"white"),new Bishop(this,"white"),new Knight(this,"white"), new Rook(this,"white"),
        ] 
    ,tilesPerRow = 8} : {pieceMap?:(Piece | null)[],tilesPerRow?:number} = {}) {

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

        for(let index = 0; index < pieceMap.length; index++){
            const piece = pieceMap[index]
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

            const tileLocation = this._indexToCoordinate(index)
            if(index < this.rowLength){ //if tile is within first row
                this.tileMap.push(new TileObject(piece,tileLocation,"white"))
            } else if(index >= pieceMap.length - this.rowLength) { //if tile is within last row
                this.tileMap.push(new TileObject(piece,tileLocation,"black"))
            } else{
                this.tileMap.push(new TileObject(piece,tileLocation,false))
            }
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

        this.updateCastleMoves()

        this.checkForPins()

        if(this.isCheck("white") || this.isCheck("black")){
            throw Error("either side cannot begin in check")
        }

        this.initialised = true
    }

    onPieceMove(piece: Piece,moveTo:Coordinate,{isFirstMove = false,causeTurnChange = true} : {isFirstMove? : Boolean,causeTurnChange? : Boolean} = {} ): void {
        const relatingVectorResult = piece.isRelatingVector(moveTo)
        
        let originTile = this.getTile(piece.location) as Tile
        let targetTile = this.getTile(moveTo)
        let excludeFromUpdate : Piece[] = [piece]

        originTile.occupant = null

        if(targetTile.occupant !== null){ //capture piece in target location
            excludeFromUpdate.push(targetTile.occupant)
            this.capturePiece(targetTile.occupant)
        }

        targetTile.occupant = piece //move to destination tile

        if(piece.canEnPassant){ //will capture piece if enpassant move
            const matchingEnPassantValidMove = piece.enPassantMovableTo.find(enPassantMove => JSON.stringify(enPassantMove.location) === JSON.stringify(moveTo))
            if(matchingEnPassantValidMove !== undefined){
                this.capturePiece(matchingEnPassantValidMove.piece,{causeUpdates:true})
            }
        }

        if(piece.species === "king"){ //check if castle has occured
            const matchingMoveSet = this.castleMoves[piece.perspective].find(castleMoveSet => castleMoveSet.kingDestination.every((v,i) => v === moveTo[i]))
            if(matchingMoveSet !== undefined){
                matchingMoveSet.rook.move(matchingMoveSet.RookDestination,{causeTurnChange:false})
                this.castleMoves[piece.perspective] = []
            }
        }


        if(this.checkInfo[this.currentTurn].status === "check"){
            this.onNoLongerCheck(this.currentTurn)
        }

        const piecesForUpdate : Piece[] =  this._ConcatUnique(this._ConcatUnique(targetTile.inVisionOf,this.forUpdateOnNextMove),originTile.inVisionOf,excludeFromUpdate)  //targetTile.inVisionOf.concat(originTile.inVisionOf)

        this.forUpdateOnNextMove = []

        targetTile.inVisionOf = []
        originTile.inVisionOf = []

        piece.location = moveTo
        piece.update()

        for(let anotherPiece of piecesForUpdate){ //updates vision of all affected tiles by the move at hand
            anotherPiece.update()
        }

        if(isFirstMove && piece.canBeEnPassanted){
            if(relatingVectorResult.exists !== true){
                throw Error(`relating vector result does not exist for en passant check.`)
            }

            if(relatingVectorResult.stepsRequired == 2){
                const verticalDirection = relatingVectorResult.vector[1] < 0 ? -1 : 1
                piece.presentSelfForEnPassant(verticalDirection)
            }
        }

        if(piece.species === "pawn" && targetTile.willUpgradePawns === piece.perspective){
            this.upgradePawn(piece)
        }

        this.updateMoveToSafeTileOnlyPieces()

        this.updateCastleMoves()

        this.checkForPins()

        if(causeTurnChange === true){
            this.changeTurn()
        }
    }

    upgradePawn(pawn:Piece) : void{
        const replacementPiece = new Queen(this,pawn.perspective)
        this.activePieces.splice(this.activePieces.indexOf(pawn),1) //remove pawn from active pieces
        replacementPiece.location = pawn.location
        replacementPiece.initialised = true
        this.getTile(pawn.location).occupant = replacementPiece
        this.activePieces.push(replacementPiece)
        replacementPiece.update()
    }


    updateMoveToSafeTileOnlyPieces() : void{
        for (let piece of this.forVisionUpdateOnEveryMove){
            if(!piece.captured){
                piece.update()
            }
        }

        for (let piece of this.forVisionUpdateOnEveryMove){
            if(!piece.captured){
                piece.update()
            }
        }
    }

    checkForPins() : void {
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


    updateCastleMoves() : void {
        const perspectivesForUpdate : Perspective[] = ["black","white"]
        for(const perspective of perspectivesForUpdate){    
            const previousCastlePositions = this.castleMoves[perspective]
            this.castleMoves[perspective] = this.generateCastlePositions(perspective)
            if(previousCastlePositions.length !== this.castleMoves[perspective].length ||  !previousCastlePositions.every(prevMoveSet => this.castleMoves[perspective].some(newMoveSet => prevMoveSet.rook === newMoveSet.rook))){ //if a change occured
                this.king[perspective]!.update()
            }
        }
    }


    generateCastlePositions(perspective:Perspective) : CastleMoveSet[] {
        if(this.isCheck(perspective) || this.king[perspective]?.isUnmoved === false){
            return []
        }

        const castlePositions = []

        for(let unMovedFriendlyRook of this.activePieces.filter(piece => piece.perspective === perspective && piece.species === "rook" && piece.isUnmoved === true)){
            const relevantVectorResult = unMovedFriendlyRook.isRelatingVector(this.king[perspective]!.location)
            if(relevantVectorResult.exists){
                const path = unMovedFriendlyRook.walk(relevantVectorResult.vector)
                if(path.obstacle === this.king[perspective]){
                    const currentKingLocation : Coordinate = this.king[perspective]!.location
                    const kingDestination : Coordinate = [currentKingLocation[0] + (relevantVectorResult.vector[0] > 0 ? -2 : 2),currentKingLocation[1]]
                    const RookDestination : Coordinate = [currentKingLocation[0] + (relevantVectorResult.vector[0] > 0 ? -1 : 1),currentKingLocation[1]]

                    if(!this.tileIsThreatenedByPerspective(this.getTile(kingDestination),this.king[perspective]!.getOpposingPerspective())){
                        castlePositions.push({
                            rook:unMovedFriendlyRook,
                            kingDestination:kingDestination,
                            RookDestination:RookDestination,
                        })
                    }
                }
            }
        }

        return castlePositions
    }




    capturePiece(piece:Piece,{causeUpdates = false} : {causeUpdates?: boolean} = {}) : void {
        const tile = this.getTile(piece.location)
        tile.occupant = null

        if(causeUpdates){
            for(let anotherPiece of tile.inVisionOf){
                anotherPiece.update()
            }
        }
        
        this.getTile(piece.location).occupant === null
        this.captured[piece.perspective === "white" ? "black" : "white"].push(piece)
        for(let location of piece.inVision){
            this.getTile(location).onNoLongerInVisionOf(piece)
        }

        this.activePieces.splice(this.activePieces.indexOf(piece),1)
        
        piece.onCaptured()
    }

    isCheck(perspective:Perspective) : boolean{
        return this.tileIsThreatenedByPerspective(this.getTile(this.king[perspective]!.location),this.king[perspective]!.getOpposingPerspective())
    }

    isCheckMateOnCheck(perspective:Perspective) : boolean{
        const relevantKing : Piece = this.king[perspective] as Piece
        const threateningPieces : Piece[] = this.getTileThreatenedBy(this.getTile(this.king[perspective]!.location),this.king[perspective]!.getOpposingPerspective())

        if(relevantKing.movableTo.length !== 0) {
            return false
        }

        if(threateningPieces.length === 1){ //friendly pieces may be able to move to block said piece
            const threateningVector = threateningPieces[0].isRelatingVector(relevantKing.location).vector
            for(let location of threateningPieces[0].walk(threateningVector,{steps:threateningPieces[0]._pathingCharacteristics.steps}).inVision.concat([threateningPieces[0].location])){ //for location in threatening path of piece that threatens king (check for friendly pieces that can move to block its path)
                for(let friendlyPiece of this.getTile(location).inVisionOf.filter(piece => piece.perspective === perspective)){ //for friendly piece that can see see the tile in question
                    if(friendlyPiece.movableTo.some(movableTo=> location.every((val,indx) => val === movableTo[indx]))){ //if friendly piece is allowed to move to this tile
                        return false
                    }
                }
            }
        }
        
        return true
    }


    isStalemate(perspective:Perspective) : boolean { //only to be called after this.isCheck() evaluates to false
        for(let friendlyPiece of this.activePieces.filter(piece => piece.perspective === perspective)){
            if(friendlyPiece.movableTo.length !== 0){
                return false
            }
        }
        return true
    }


    onNoLongerCheck(perspective:Perspective) : void {

        console.log(`${perspective} is no longer in check`)

        this.checkInfo[perspective] = {...this.checkInfo[perspective],status:"none",threateningPieces:[]}
        
        for(let friendlyPiece of this.activePieces.filter(piece => piece.perspective === this.currentTurn)){
            friendlyPiece.update()
        }
    }

    onCheck(perspective:Perspective) : void{
        console.log(`${perspective} is in check`)

        if(this.isCheckMateOnCheck(perspective)){
            this.onCheckMate(perspective)
            return
        }


        this.checkInfo[perspective] = {...this.checkInfo[perspective],status:"check",threateningPieces:[]}

        const threateningPieces : Piece[] = this.getTile(this.king[perspective]!.location).inVisionOf.filter(piece => piece.perspective !== perspective) //all pieces that threaten the king
        for(let threat of threateningPieces){
            const relevantThreatVector = threat.isRelatingVector(this.king[perspective]!.location).vector
            const threatPath = threat.walk(relevantThreatVector,{steps:threat._pathingCharacteristics.steps}).inVision
            this.checkInfo[perspective].threateningPieces.push({
                piece:threat,
                alongPath:threatPath
            })
        }

        for(let friendlyPiece of this.activePieces.filter(piece => piece.perspective === perspective)){
            friendlyPiece.update()
        }
    }

    onCheckMate(perspective:Perspective) : void{
        console.log(`${perspective} has been checkmated!`)
    }

    onStaleMate() : void {
        console.log("stalemate!")
    }

    changeTurn() : void {
        this.currentTurn = this.currentTurn === "white" ? "black" : "white"
        this.onTurnChange()
    }

    onTurnChange() : void {
        console.log(this.currentTurn)
        this.turnCount ++

        if(this.isCheck(this.currentTurn)){
            this.onCheck(this.currentTurn)
        } else{
            if(this.isStalemate(this.currentTurn)){
                this.onStaleMate()
            }
        }

    }


    getTileThreatenedBy(tile:Tile,perspective:Perspective) : Piece[] {
        const threats : Piece[] = []
        
        for(let potentialThreat of tile.inVisionOf.filter(piece => piece.perspective === perspective)){
            const relevantVector = potentialThreat.isRelatingVector(tile.location)
            if(!relevantVector.pathingCharacteristics.isOnlyMovableToEmptyTiles){
                threats.push(potentialThreat)
            }
        }

        return threats
    }

    tileIsThreatenedByPerspective(tile:Tile,perspective:Perspective) : boolean {
        for(let potentialThreat of tile.inVisionOf.filter(piece => piece.perspective === perspective)){
            const relevantVector = potentialThreat.isRelatingVector(tile.location)
            if(!relevantVector.pathingCharacteristics.isOnlyMovableToEmptyTiles){
                return true
            }
        }

        return false
    }


    tileIsInVisionOfPerspective(tile:Tile,perspective:Perspective) : boolean{
        return tile.inVisionOf.filter(piece => piece.perspective === perspective).length !== 0
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


    _initialisePiece(piece:Piece,{isSecondInit = false}:{isSecondInit?:boolean} = {}) : void{
        piece.location = this._generatePieceLocation(piece)
        piece.update()
        if(!(piece._pathingCharacteristics.isOnlyMovableToSafeTiles === true && isSecondInit === false)){
            piece.initialised = true
        }
    }

    _generatePieceLocation(piece:Piece) : [number,number]{
        const matchingTile = this.tileMap.find((tile)=>piece === tile.occupant)

        if(!matchingTile){
            throw {
                message:"on _generatePieceLocation() could not locate piece within tileMap",
                piece:piece
            }
        }

        const tileIndex = this.tileMap.indexOf(matchingTile)

        return this._indexToCoordinate(tileIndex)
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
}

export default ChessBoard