import { Coordinate,Piece,Board,Species,Perspective,Vector,PathingCharacteristics, VectorPathingCharacteristic, OptionalWalkPathingCharacteristics, CastleMoveSet} from "./types";

class BlankPiece implements Piece { //
    initialised:boolean = false

    isUnmoved: boolean = true

    isPinned: boolean = false
    pinnedBy: Piece[] = []
    captured: boolean = false
    species : Species = "generic"
    movableTo: Coordinate[] = []
    location: [number, number] = [-1,-1];
    inVision: Coordinate[] = []
    _pathingCharacteristics: PathingCharacteristics = {
        steps:-1,
        vectors:[],
        isOnlyMovableToSafeTiles:false,
        isOnlyMovableToOccupiedTiles:false,
        isOnlyMovableFromOriginalLocation:false,
        isOnlyMovableToEmptyTiles:false
    }

    canEnPassant:boolean = false
    canBeEnPassanted:boolean = false
    enPassantMovableTo: { piece:Piece, location:Coordinate, validUntilTurn:number }[] = []

    constructor(public parentBoard:Board,public perspective:Perspective){}

    update(): void { //updates this.inVision & this.movableTo , aswell as updating all affected tiles
        const oldInVision : Coordinate[] = this.inVision
        if(this.canEnPassant){
            for(let enPassantOption of this.enPassantMovableTo){ //remove all now invalid enPassant moves
                if(this.parentBoard.turnCount >= enPassantOption.validUntilTurn) {
                    this.enPassantMovableTo.splice(this.enPassantMovableTo.indexOf(enPassantOption),1)
                }
            }
        }

        const generatedVisionResult = this.generateVision()

        this.movableTo = generatedVisionResult.movableTo
        this.inVision = generatedVisionResult.inVision

        for(let location of oldInVision){ //update tiles vision that are no longer in vision
            if(!(this.inVision.some(a=> location.every((v,i) => v === a[i])))){
                this.parentBoard.getTile(location).onNoLongerInVisionOf(this)
            }
        }

        for(let location of this.inVision){ //updates all tiles that are now in vision
            this.parentBoard.getTile(location).onInVisionOf(this)
        }
    }

    generateVision() : {inVision:Coordinate[],movableTo:Coordinate[]} {
        let newMovableTo : Coordinate[] = []
        let newInVision  : Coordinate[] = []

        for(let vector of this._pathingCharacteristics.vectors){
            let pathing
            if(Array.isArray(vector)){
                pathing = this.walk(vector,{steps:this._pathingCharacteristics.steps})
            } else {
                pathing = this.walk(vector.vector,{...this._pathingCharacteristics,...vector.pathingCharacteristics})
            }

            newMovableTo = newMovableTo.concat(pathing.movableTo)
            newInVision = newInVision.concat(pathing.inVision)
        }


        if(this.species === "king"){ //castle
            for(let castleMoveSet of this.parentBoard.castleMoves[this.perspective]){
                newMovableTo.push(castleMoveSet.kingDestination) //only push to movable to
            }
        }

        if(this.canEnPassant){ //update for all valid enPassant moves
            for(let enPassantOption of this.enPassantMovableTo){//check each enPassant option
                if(this.parentBoard.turnCount < enPassantOption.validUntilTurn){ //if valid on this turn
                        newMovableTo.push(enPassantOption.location)
                        newInVision.push(enPassantOption.location)
                }
            }
        }


        if(this.isPinned){
            const overWriteMovableTo = [...newMovableTo]
            if(this.pinnedBy.length === 1){ //checks if the pinned piece can potentially move to capture the piece that is pinning it
                const pinningPiece = this.pinnedBy[0]
                const pinningPieceVectorResult = pinningPiece.isRelatingVector(this.parentBoard.king[this.perspective]!.location)

                const validBlockMoves = pinningPiece.walk(pinningPieceVectorResult.vector,{ignoredObstacles:[this]}).inVision.concat([pinningPiece.location])
                
                for(let move of newMovableTo){
                    if(!(validBlockMoves.some(location => move.every((v,i) => v === location[i])))){ //remove all moves from newMovableTo that are not within the path of the pinning piece, or the pinning piece's location
                        overWriteMovableTo.splice(overWriteMovableTo.indexOf(move),1)
                    }
                }
            }
            newMovableTo = overWriteMovableTo
        }


        if(this._pathingCharacteristics.isOnlyMovableToSafeTiles){ //removes all tiles from movable to that will be unsafe on next move also, after it has moved.         
            let unsafeTilesForNextMove : Coordinate[] = []
            
            for(let threat of this.parentBoard.getTile(this.location).inVisionOf.filter(piece => piece.perspective === this.getOpposingPerspective())){
                const relativeVectorResult = threat.isRelatingVector(this.location)
                unsafeTilesForNextMove = unsafeTilesForNextMove.concat(threat.walk(relativeVectorResult.vector,{ignoredObstacles:[this]}).inVision)
            }

            let validMovableTo : Coordinate[] = []

            for(let location of newMovableTo){
                if(!unsafeTilesForNextMove.some(unafeTileLocation=> location.every((val,indx) => val === unafeTileLocation[indx]))){
                    validMovableTo.push(location)
                }
            }

            newMovableTo = validMovableTo
        }

        if(this.parentBoard.checkInfo[this.perspective].status === "check" && this.species !== "king"){
            let overwriteNewMovableTo = []
            if(this.parentBoard.checkInfo[this.perspective].threateningPieces.length === 1){ //if there is only one piece that need to be blocked

                const blockCheckLocations : Coordinate[] = [...this.parentBoard.checkInfo[this.perspective].threateningPieces[0].alongPath,(this.parentBoard.checkInfo[this.perspective].threateningPieces[0].piece.location)]

                for(let location of newMovableTo){
                    if(blockCheckLocations.some(blockCheckLocation=> location.every((val,indx) => val === blockCheckLocation[indx]))){ //if location is included within the threatPath
                        overwriteNewMovableTo.push(location) 
                    }
                }
            }
            newMovableTo = overwriteNewMovableTo //now contains only locations that blocks check threat
        }

        return {
            inVision:newInVision,
            movableTo:newMovableTo
        }
    }

    move(destination: Coordinate,{causeTurnChange = true} : {causeTurnChange? : boolean} = {}): void { //moves piece
        if(!this.movableTo.some(movableTo=> destination.every((val,indx) => val === movableTo[indx]))){
            throw Error(`invalid destination, not within movableTo.`)
        }

        if(this.parentBoard.currentTurn === this.perspective){
            const isFirstMove = this.isUnmoved
            this.isUnmoved = false
            this.parentBoard.onPieceMove(this,destination,{isFirstMove:isFirstMove,causeTurnChange:causeTurnChange})
        }
    }

    walk(vector:Vector,{steps = this._pathingCharacteristics.steps,startLocation = this.location, ignoredObstacles=[],isOnlyMovableToSafeTiles = this._pathingCharacteristics.isOnlyMovableToSafeTiles, isOnlyMovableToOccupiedTiles = this._pathingCharacteristics.isOnlyMovableToOccupiedTiles, isOnlyMovableToEmptyTiles = this._pathingCharacteristics.isOnlyMovableToEmptyTiles,isOnlyMovableFromOriginalLocation = this._pathingCharacteristics.isOnlyMovableFromOriginalLocation,existsOnlyForPerspective = false,canCapture = true} : OptionalWalkPathingCharacteristics = {}) : {movableTo:Coordinate[], inVision:Coordinate[],obstacle:Piece | null }{ //returns all tiles in vision, and all tiles in vision & movableTo, along a given vector
        let hasMetObstacle :boolean = false    
        let movableTo : Coordinate[] = []
        let inVision : Coordinate[] = []
        let lastLocation : Coordinate = startLocation

        let stepsTaken : number = 0

        let obstacle : Piece | null = null
        
        while(!hasMetObstacle && (steps === -1 || stepsTaken < steps) && (!isOnlyMovableFromOriginalLocation || (isOnlyMovableFromOriginalLocation && this.isUnmoved)) && (!existsOnlyForPerspective || existsOnlyForPerspective === this.perspective)){
            const nextLocation : Coordinate = [lastLocation[0] + vector[0],lastLocation[1] + vector[1]]

            if(!this.parentBoard.tileDoesExist(nextLocation)){ //if next location is off the board
                break
            }

            const nextTile = this.parentBoard.getTile(nextLocation)
            inVision.push(nextLocation)

            if(isOnlyMovableToSafeTiles && this.parentBoard.tileIsThreatenedByPerspective(nextTile,this.getOpposingPerspective())){ //next tile is threatened and walkUntilThreatened paramter was passed as true
                if(nextTile.occupant === null){
                    lastLocation = nextLocation
                    stepsTaken ++
                    continue
                } else{
                    break
                }
            }

            if(nextTile.occupant === null){
                if(!isOnlyMovableToOccupiedTiles) {
                    movableTo.push(nextLocation)
                }
            }

            if(nextTile.occupant !== null && !ignoredObstacles.includes(nextTile.occupant)){
                if(nextTile.occupant.perspective === this.getOpposingPerspective() && !isOnlyMovableToEmptyTiles && canCapture){
                    movableTo.push(nextLocation)
                }

                obstacle = nextTile.occupant
                hasMetObstacle = true
            }

            lastLocation = nextLocation
            stepsTaken ++
        }
        return {
            movableTo:movableTo,
            inVision:inVision,
            obstacle:obstacle
        }
    }

    onCaptured() : void {
        this.captured = true
        this.location = [-1,-1]
        for(let location of this.inVision){
            this.parentBoard.getTile(location).onNoLongerInVisionOf(this)
        }
        this.inVision = []
        this.movableTo = []
        
        this.isPinned = false
        this.pinnedBy = []
    }

    presentSelfForEnPassant(verticalDirection: -1 | 1) : void { //should only be called on first move, if moved two tiles
        if(this.canBeEnPassanted){
            const vectorsToCheck : Vector[] = [[1,0],[-1,0]]

            for(let vector of vectorsToCheck){

                const potentialPieceCoordinate : Coordinate = [this.location[0] + vector[0],this.location[1] + vector[1]]

                if(this.parentBoard.tileDoesExist(potentialPieceCoordinate) === true){
                    const occupant = (this.parentBoard.getTile(potentialPieceCoordinate).occupant)
                    if(occupant !== null) {
                        if(occupant.perspective === this.getOpposingPerspective() && occupant.canEnPassant === true){
                            occupant.enPassantMovableTo.push(
                                {
                                    piece:this,
                                    location:[this.location[0],this.location[1] + (verticalDirection * -1)],
                                    validUntilTurn:this.parentBoard.turnCount + 1
                                }
                            )
                            occupant.update()
                            this.parentBoard.forUpdateOnNextMove.push(occupant)
                        }
                    }
                }
            }
        }
    }
    

    getPinnedBy(): Piece[]{
        let pinnedBy: Piece[] = []
        for(let piece of this.parentBoard.getTile(this.location).inVisionOf){
            if(piece.perspective === this.getOpposingPerspective()){
                const relevantVector = piece.isRelatingVector(this.location).vector as Vector
                const pathing = piece.walk(relevantVector,{ignoredObstacles:[this],steps:piece._pathingCharacteristics.steps})
                if(pathing.obstacle === this.parentBoard.king[this.perspective]){
                    pinnedBy.push(piece)
                }
            }
        }

        return pinnedBy
    }


    isRelatingVector(location:Coordinate) : {exists:boolean , vector: Vector, pathingCharacteristics:OptionalWalkPathingCharacteristics , stepsRequired:number}{
        
        const locationDifference : Vector = [location[0] - this.location[0],location[1] - this.location[1]]

        for(const vectorCharacteristic of this._pathingCharacteristics.vectors){
            const vector = this._getVectorFromVectorCharacteristic(vectorCharacteristic)

            if(((locationDifference[0] > 0 && vector[0] > 0) || (locationDifference[0] < 0 && vector[0] < 0) || (locationDifference[0] === 0 && vector[0] === 0))  && ((locationDifference[1] > 0 && vector[1] > 0) || (locationDifference[1] < 0 && vector[1] < 0) || (locationDifference[1] === 0 && vector[1] === 0))){ //if vector is postive / negative aswell as location Difference translation                
                if((locationDifference[0] % vector[0] === 0 || locationDifference[0] === 0 && vector[0] === 0) && (locationDifference[1] % vector[1] === 0 || locationDifference[1] === 0 && vector[1] === 0)){
                    return {
                        exists:true,
                        vector:vector,
                        pathingCharacteristics:Array.isArray(vectorCharacteristic) ? {} : vectorCharacteristic.pathingCharacteristics,
                        stepsRequired:locationDifference[0] !== 0 ? locationDifference[0] / vector[0] : locationDifference[1] !== 0 ? locationDifference[1] / vector[1] : 0
                    }
                }
            }
        }

        return {
            exists:false,
            vector:[0,0],
            pathingCharacteristics:{},
            stepsRequired:-1
        }
    }

    getOpposingPerspective() : Perspective{
        return this.perspective === "white" ? "black" : "white"
    }

    _getVectorFromVectorCharacteristic(vectorCharacteristic : VectorPathingCharacteristic) : Vector {
        if(Array.isArray(vectorCharacteristic)){
            return vectorCharacteristic
        } else {
           return vectorCharacteristic.vector
        }
    }

}

export default BlankPiece