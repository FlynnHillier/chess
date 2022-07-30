export type Perspective = "white" | "black"

export type Vector = [insideIndexShift: number,outsideIndexShift: number]

export type Species = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "generic"

export type Coordinate = [insideIndex: number,outsideIndex: number]

export interface Piece {
    initialised:boolean
    parentBoard:Board
    perspective:Perspective
    captured:boolean
    location:[number,number]
    movableTo:Coordinate[]
    species: Species
    move(destination:Coordinate):void
    _walk(vector:Vector,steps:number) : Coordinate[]
    updateVision():void
}

export interface Tile {
    occupant:null | Piece,
    inVisionOf:Piece[],
    onInVisionOf(piece:Piece):void
}

export interface Board {
    initialised:boolean
    tileMap:Tile[][],
    captured: {
        white: Piece[],
        black: Piece[]
    }
    perspective:Perspective,
    onPieceMove(piece:Piece,moveTo:Coordinate):void
    getTile(location:Coordinate):Tile
    tileDoesExist(location:Coordinate) : boolean
    _ConcatUnique(array_one:Array<any>,array_two:Array<any>):Array<any>
    init(tileMap:(Piece | null)[][]):void
    _initialisePiece(piece:Piece) : void
    _getPieceLocation(piece:Piece) : [number,number]
}