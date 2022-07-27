import { Coordinate,Piece,Board,Species,Perspective,Vector} from "./types";

class BlankPiece implements Piece { //
    initialised:boolean = false
    captured: boolean = false
    species : Species = "generic"
    movableTo: Coordinate[] = []
    location: [number, number] = [-1,-1];

    constructor(public parentBoard:Board,public perspective:Perspective){}

    move(destination: Coordinate): void {
        if(!this.movableTo.some(movableTo=> destination.every((val,indx) => val === movableTo[indx]))){
            throw Error(`invalid destination, not within movableTo.`)
        }
        this.parentBoard.onPieceMove(this,destination)
        // this.location = destination
        // this.updateVision()
    }

    _walk(vector:Vector,steps : number = -1){
        let hasMetObstacle :boolean = false    
        let path : Coordinate[] = []
        let lastLocation : Coordinate = this.location

        let stepsTaken : number = 0
        while(!hasMetObstacle && (steps === -1 || stepsTaken < steps)){
            const nextLocation : Coordinate = [lastLocation[0] + vector[0],lastLocation[1] + vector[1]]

            if(!this.parentBoard.tileDoesExist(nextLocation)){ //if next location is off the board
                return path
            }

            const nextTile = this.parentBoard.getTile(nextLocation)
            nextTile.onInVisionOf(this)

            if(nextTile.occupant === null){
                path.push(nextLocation)
            }

            if(nextTile.occupant !== null){
                if(nextTile.occupant.perspective !== this.perspective){
                    path.push(nextLocation)
                }
                hasMetObstacle = true
            }

            lastLocation = nextLocation
            stepsTaken ++
        }

        return path
    }

    updateVision(): void {
        this.movableTo = []
    }
}

export default BlankPiece