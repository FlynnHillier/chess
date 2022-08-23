export type Perspective = "white" | "black"

export type Vector = [insideIndexShift: number,outsideIndexShift: number]

export type Species = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "generic"

export type Coordinate = [insideIndex: number,outsideIndex: number]


type Required<T> = {
    [P in keyof T]-?: T[P];
};

interface _OptionalPathingCharacteristics {
    steps?:number,
    isOnlyMovableToSafeTiles?:boolean,
    isOnlyMovableToOccupiedTiles?: boolean,
    isOnlyMovableToEmptyTiles?:boolean,
    isOnlyMovableFromOriginalLocation?:boolean,
}

export type VectorPathingCharacteristic = ({
    vector:Vector, 
    pathingCharacteristics:OptionalWalkPathingCharacteristics
} | Vector)


export interface PathingCharacteristics extends Required<_OptionalPathingCharacteristics> {
    vectors:VectorPathingCharacteristic[]
}


export interface OptionalWalkPathingCharacteristics extends _OptionalPathingCharacteristics {
    ignoredObstacles?:Piece[]
    startLocation?:Coordinate
    canCapture?: boolean
    existsOnlyForPerspective?:false | Perspective
}



export interface Piece {
    initialised: boolean
    parentBoard:Board
    perspective:Perspective
    species: Species
    _pathingCharacteristics: PathingCharacteristics
    
    inVision: Coordinate[]
    movableTo:Coordinate[]

    isPinned:boolean
    pinnedBy: Piece[]

    captured:boolean
    location:[number,number]

    isUnmoved: boolean

    canEnPassant:boolean
    canBeEnPassanted:boolean
    enPassantMovableTo: {
        piece:Piece,
        location:Coordinate,
        validUntilTurn:number
    }[]

    update(): void
    generateVision() : {inVision:Coordinate[],movableTo:Coordinate[]}
    
    move(destination:Coordinate):void
    walk(vector:Vector,config?:OptionalWalkPathingCharacteristics) : {movableTo:Coordinate[], inVision:Coordinate[],obstacle:Piece | null }

    onCaptured() : void

    getPinnedBy() : Piece[]

    isRelatingVector(location:Coordinate) : {exists:boolean , vector: Vector, pathingCharacteristics:OptionalWalkPathingCharacteristics , stepsRequired:number}

    getOpposingPerspective() : Perspective

    presentSelfForEnPassant(verticalDirection: -1 | 1) : void
}

export interface Tile {
    location:Coordinate,
    willUpgradePawns: false | Perspective,
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
    turnCount : number

    forVisionUpdateOnEveryMove : Piece[]
    forUpdateOnNextMove : Piece[]

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
    onPieceMove(piece:Piece,moveTo:Coordinate,isFirstMove : boolean):void

    updateMoveToSafeTileOnlyPieces() : void
    checkForPins() : void

    capturePiece(piece:Piece,{} : {causeUpdates: boolean}) : void

    isCheck(perspective:Perspective) : boolean
    isCheckMateOnCheck(perspective:Perspective) : boolean
    onNoLongerCheck(perspective:Perspective) : void
    onCheck(perspective:Perspective) : void
    onCheckMate(perspective:Perspective) : void

    isStalemate(perspective:Perspective) : boolean 
    onStaleMate() : void

    changeTurn() : void
    onTurnChange() : void

    tileIsThreatenedByPerspective(tile:Tile,perspective:Perspective) : boolean
    tileIsInVisionOfPerspective(tile:Tile,perspective:Perspective):boolean
    tileDoesExist(location:Coordinate) : boolean
    getTile(location:Coordinate):Tile

    _initialisePiece(piece:Piece) : void
    _generatePieceLocation(piece:Piece) : [number,number]
    _indexToCoordinate(index:number) : Coordinate
    _coordinateToIndex(coordinate:Coordinate) : number
    _ConcatUnique(array_one:Array<any>,array_two:Array<any>):Array<any>
}