export type Perspective = "white" | "black"

export type Vector = [insideIndexShift: number,outsideIndexShift: number]

export type Species = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "generic"

export type Coordinate = [insideIndex: number,outsideIndex: number]

export interface Piece {
    inVision: Coordinate[]
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean }
    initialised:boolean
    parentBoard:Board
    perspective:Perspective
    captured:boolean
    location:[number,number]
    movableTo:Coordinate[]
    species: Species
    pinnedBy: Piece[]
    isPinned:boolean
    pinnedPieces:Piece[]
    onPinnedBy(pinningPiece:Piece):void
    onNoLongerPinnedBy(pinningPiece:Piece) : void
    isRelatingVector(piece:Piece) : {exists:boolean , vector: Vector , stepsRequired:number}
    checkOpposingPieceIsPinned(opposingPiece:Piece,{} : {vector? : Vector}) : boolean
    getOpposingPerspective() : Perspective
    onCaptured() : void
    move(destination:Coordinate):void
    walk(vector:Vector,{} : {steps?: number, startLocation?: Coordinate, ignoredObstacles: Piece[]}) : {movableTo:Coordinate[], inVision:Coordinate[],obstacle:Piece | null }
    update():void
}

export interface Tile {
    occupant:null | Piece,
    inVisionOf:Piece[],
    onInVisionOf(piece:Piece):void
    onNoLongerInVisionOf(piece:Piece) : void
}

export interface Board {
    initialised:boolean
    tileMap:Tile[],
    rowLength:number,
    captured: {
        white: Piece[],
        black: Piece[]
    }
    perspective:Perspective,
    king: {
        white:Piece | null,
        black:Piece | null
    }

    pinnedPieces:{
        white:Piece[]
        black:Piece[]
    }

    tileIsInVisionOfPerspective(tile:Tile,perspective:Perspective):boolean
    onPieceMove(piece:Piece,moveTo:Coordinate):void
    onKingMove(perspective:Perspective) : void
    getTile(location:Coordinate):Tile
    tileDoesExist(location:Coordinate) : boolean
    _ConcatUnique(array_one:Array<any>,array_two:Array<any>):Array<any>
    init({tileMap,tilesPerRow}:{tileMap?:(Piece | null)[],tilesPerRow?:number}):void
    _initialisePiece(piece:Piece) : void
    _getPieceLocation(piece:Piece) : [number,number]
}