import { Coordinate,Piece,Board,Species,Perspective,Vector} from "./types";

class BlankPiece implements Piece { //
    initialised:boolean = false


    isPinned: boolean = false
    pinnedBy: Piece[] = []
    captured: boolean = false
    species : Species = "generic"
    movableTo: Coordinate[] = []
    location: [number, number] = [-1,-1];
    inVision: Coordinate[] = []
    _pathingCharacteristics: { steps:number,vectors:Vector[],isOnlyMovableToSafeTiles:boolean } = {
        steps:-1,
        vectors:[],
        isOnlyMovableToSafeTiles:false,
    }

    constructor(public parentBoard:Board,public perspective:Perspective){}

    update(): void { //updates this.inVision & this.movableTo , aswell as updating all affected tiles
        const oldInVision : Coordinate[] = this.inVision

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
            const pathing = this.walk(vector,{steps:this._pathingCharacteristics.steps})
            newMovableTo = newMovableTo.concat(pathing.movableTo)
            newInVision = newInVision.concat(pathing.inVision)
        }




        if(this.isPinned){
            newMovableTo = []
            if(this.pinnedBy.length === 1){ //checks if the pinned piece can potentially move to capture the piece that is pinning it
                const isRelatingVectorResult = this.isRelatingVector(this.pinnedBy[0])
                if(isRelatingVectorResult.exists){
                    newMovableTo = this.walk(isRelatingVectorResult.vector,{steps:this._pathingCharacteristics.steps}).movableTo
                }
            }
        }


        if(this._pathingCharacteristics.isOnlyMovableToSafeTiles){ //removes all tiles from movable to that will be unsafe on next move also, after it has moved.         
            let unsafeTilesForNextMove : Coordinate[] = []
            
            for(let threat of this.parentBoard.getTile(this.location).inVisionOf){
                if(threat.perspective !== this.getOpposingPerspective()){
                    continue
                }
                const relativeVectorResult = threat.isRelatingVector(this)
                unsafeTilesForNextMove = unsafeTilesForNextMove.concat(threat.walk(relativeVectorResult.vector).inVision)
            }

            let validMovableTo : Coordinate[] = []

            for(let location of newMovableTo){
                if(!unsafeTilesForNextMove.some(movableTo=> location.every((val,indx) => val === movableTo[indx]))){
                    validMovableTo.push(location)
                }
            }

            newMovableTo = validMovableTo
        }

        if(this.parentBoard.checkInfo[this.perspective].status === "check" && this.species !== "king"){
            let overwriteNewMovableTo = []
            if(this.parentBoard.checkInfo[this.perspective].threateningPieces.length === 1){ //if there is only one piece that need to be blocked

                const blockCheckLocations : Coordinate[] = [...this.parentBoard.checkInfo[this.perspective].threateningPieces[0].alongPath,(this.parentBoard.checkInfo[this.perspective].threateningPieces[0].piece.location)]

                console.log("bcl:")
                console.log(blockCheckLocations)

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

    move(destination: Coordinate): void { //moves piece
        if(!this.movableTo.some(movableTo=> destination.every((val,indx) => val === movableTo[indx]))){
            throw Error(`invalid destination, not within movableTo.`)
        }
        this.parentBoard.onPieceMove(this,destination)
    }

    walk(vector:Vector,{steps = -1,startLocation = this.location, ignoredObstacles=[]} : {steps?:number,startLocation? : Coordinate, ignoredObstacles?: Piece[]} = {}) : {movableTo:Coordinate[], inVision:Coordinate[],obstacle:Piece | null }{ //returns all tiles in vision, and all tiles in vision & movableTo, along a given vector
        let hasMetObstacle :boolean = false    
        let movableTo : Coordinate[] = []
        let inVision : Coordinate[] = []
        let lastLocation : Coordinate = startLocation

        let stepsTaken : number = 0

        let obstacle : Piece | null = null
        
        while(!hasMetObstacle && (steps === -1 || stepsTaken < steps)){
            const nextLocation : Coordinate = [lastLocation[0] + vector[0],lastLocation[1] + vector[1]]

            if(!this.parentBoard.tileDoesExist(nextLocation)){ //if next location is off the board
                break
            }

            const nextTile = this.parentBoard.getTile(nextLocation)
            inVision.push(nextLocation)

            if(this._pathingCharacteristics.isOnlyMovableToSafeTiles && this.parentBoard.tileIsInVisionOfPerspective(nextTile,this.perspective === "white" ? "black" : "white")){ //next tile is threatened and walkUntilThreatened paramter was passed as true
                lastLocation = nextLocation
                stepsTaken ++
                continue
            }

            if(nextTile.occupant === null){
                movableTo.push(nextLocation)
            }

            if(nextTile.occupant !== null && !ignoredObstacles.includes(nextTile.occupant)){
                if(nextTile.occupant.perspective !== this.perspective){
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


    getPinnedBy(): Piece[]{
        let pinnedBy: Piece[] = []
        for(let piece of this.parentBoard.getTile(this.location).inVisionOf){
            if(piece.perspective === this.getOpposingPerspective()){
                const relevantVector = piece.isRelatingVector(this).vector as Vector
                const pathing = piece.walk(relevantVector,{ignoredObstacles:[this],steps:piece._pathingCharacteristics.steps})
                if(pathing.obstacle === this.parentBoard.king[this.perspective]){
                    pinnedBy.push(piece)
                }
            }
        }

        return pinnedBy
    }


    isRelatingVector(piece:Piece) : {exists:boolean , vector: Vector , stepsRequired:number}{
        const locationDifference : Vector = [piece.location[0] - this.location[0],piece.location[1] - this.location[1]]

        for(let vector of this._pathingCharacteristics.vectors){
            if(((locationDifference[0] >= 0 && vector[0] >= 0) || (locationDifference[0] < 0 && vector[0] < 0))  && ((locationDifference[1] >= 0 && vector[1] >= 0) || (locationDifference[1] < 0 && vector[1] < 0))){ //if vector is postive / negative aswell as location Difference translation
                if(locationDifference[0] % vector[0] === 0 && locationDifference[1] % vector[1] === 0){
                    return {
                        exists:true,
                        vector:vector,
                        stepsRequired:locationDifference[0] / vector[0]
                    }
                }
            }
        }

        return {
            exists:false,
            vector:[0,0],
            stepsRequired:-1
        }
    }

    getOpposingPerspective() : Perspective{
        return this.perspective === "white" ? "black" : "white"
    }
}

export default BlankPiece