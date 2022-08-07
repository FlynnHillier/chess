import { Coordinate,Piece,Board,Species,Perspective,Vector} from "./types";

class BlankPiece implements Piece { //
    initialised:boolean = false
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

    move(destination: Coordinate): void { //moves piece
        if(!this.movableTo.some(movableTo=> destination.every((val,indx) => val === movableTo[indx]))){
            throw Error(`invalid destination, not within movableTo.`)
        }
        this.parentBoard.onPieceMove(this,destination)
    }

    _walk(vector:Vector,{steps = -1} : {steps?:number} = {}) : {movableTo:Coordinate[], inVision:Coordinate[] }{ //returns all tiles in vision, and all tiles in vision & movableTo, along a given vector
        let hasMetObstacle :boolean = false    
        let movableTo : Coordinate[] = []
        let inVision : Coordinate[] = []
        let lastLocation : Coordinate = this.location

        let stepsTaken : number = 0
        
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

            if(nextTile.occupant !== null){
                if(nextTile.occupant.perspective !== this.perspective){
                    movableTo.push(nextLocation)
                }
                hasMetObstacle = true
            }

            lastLocation = nextLocation
            stepsTaken ++
        }
        return {
            movableTo:movableTo,
            inVision:inVision
        }
    }

    updateVision(): void { //updates this.inVision & this.movableTo , aswell as updating all affected tiles
        const oldInVision = this.inVision
        const generatedVision = this.generateVision()

        this.movableTo = generatedVision.movableTo
        this.inVision = generatedVision.inVision

        for(let location of oldInVision){ //update tiles vision that are no longer in vision
            if(!(this.inVision.some(a=> location.every((v,i) => v === a[i])))){
                this.parentBoard.getTile(location).onNoLongerInVisionOf(this)
            }
        }

        for(let location of this.inVision){ //updates all tiles that are now in vision
            this.parentBoard.getTile(location).onInVisionOf(this)
        }
    }


    generateVision() : {inVision:Coordinate[],movableTo:Coordinate[]}{ //generates all tiles in Vision, and all tiles in Vision that are also movable To (non-friendly pieces [ & safe squares if only move to safe squares])
        let bundledMovableTo : Coordinate[] = []
        let bundledInVision : Coordinate[] = []
        for(let vector of this._pathingCharacteristics.vectors){
            const visionSet = this._walk(vector,{steps:this._pathingCharacteristics.steps})
            
            bundledMovableTo = bundledMovableTo.concat(visionSet.movableTo)
            bundledInVision = bundledInVision.concat(visionSet.inVision)
        }

        return {
            inVision:bundledInVision,
            movableTo:bundledMovableTo
        }
    }
}

export default BlankPiece