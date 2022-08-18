export type Perspective = "white" | "black"

export type Vector = [insideIndexShift: number,outsideIndexShift: number]

export type Species = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "generic"

export type Coordinate = [insideIndex: number,outsideIndex: number]

export interface Piece {
    initialised: boolean
    parentBoard:Board
    perspective:Perspective
    species: Species
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean }
    
    inVision: Coordinate[]
    movableTo:Coordinate[]

    isPinned:boolean
    pinnedBy: Piece[]

    captured:boolean
    location:[number,number]

    update(): void
    generateVision() : {inVision:Coordinate[],movableTo:Coordinate[]}
    
    move(destination:Coordinate):void
    walk(vector:Vector,{steps,startLocation,ignoredObstacles}? : {steps?: number, startLocation?: Coordinate, ignoredObstacles?: Piece[]}) : {movableTo:Coordinate[], inVision:Coordinate[],obstacle:Piece | null }

    onCaptured() : void

    getPinnedBy() : Piece[]

    isRelatingVector(piece:Piece) : {exists:boolean , vector: Vector , stepsRequired:number}

    getOpposingPerspective() : Perspective
}

export interface Tile {
    occupant:null | Piece,
    inVisionOf:Piece[],
    onInVisionOf(piece:Piece):void
    onNoLongerInVisionOf(piece:Piece) : void
}

export interface Board {
    initialised:boolean

    perspective:Perspective,
    tileMap:Tile[],
    rowLength:number,

    currentTurn: Perspective

    forVisionUpdateOnEveryMove : Piece[]

    checkInfo : { 
        white: { status: "none" | "check" | "checkmate"; threateningPieces: { piece: Piece; alongPath: Coordinate[]; }[]; }
        black:{ status: "none" | "check" | "checkmate"; threateningPieces: { piece: Piece; alongPath: Coordinate[]; }[]; }
    }
    captured: {
        white: Piece[],
        black: Piece[]
    }
    king: {
        white:Piece | null,
        black:Piece | null
    }


    init({tileMap,tilesPerRow}:{tileMap?:(Piece | null)[],tilesPerRow?:number}):void
    onPieceMove(piece:Piece,moveTo:Coordinate):void

    updateMoveToSafeTileOnlyPieces() : void
    checkForPins() : void

    capturePiece(piece:Piece) : void

    isCheck(perspective:Perspective) : boolean
    isCheckMateOnCheck(perspective:Perspective) : boolean
    onNoLongerCheck(perspective:Perspective) : void
    onCheck(perspective:Perspective) : void
    onCheckMate(perspective:Perspective) : void

    changeTurn() : void
    onTurnChange() : void

    tileIsInVisionOfPerspective(tile:Tile,perspective:Perspective):boolean
    tileDoesExist(location:Coordinate) : boolean
    getTile(location:Coordinate):Tile

    _initialisePiece(piece:Piece) : void
    _generatePieceLocation(piece:Piece) : [number,number]
    _indexToCoordinate(index:number) : Coordinate
    _coordinateToIndex(coordinate:Coordinate) : number
    _ConcatUnique(array_one:Array<any>,array_two:Array<any>):Array<any>
}