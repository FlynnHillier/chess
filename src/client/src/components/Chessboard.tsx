import React, {useState, useEffect} from 'react'

import "./../styles/chessboard.css"

import { Container } from 'react-bootstrap'
import {Board,Piece,Coordinate} from "chess-online-common"

import ChessTile from "./ChessTile"

interface Props {
    game:Board,
}


const Chessboard = (props:Props) => {
    let [hoveredTile,setHoveredTile] = useState<null | [number,number]>(null)
    let [selectedPiece,setSelectedPiece] = useState<null | Piece>(null)
    let [selectedPieceCoordinate,setSelectedPieceCoordinate] = useState<null | Coordinate>(null)


    useEffect(()=>{
        console.log(hoveredTile)
    },[hoveredTile])

    useEffect(()=>{
        if(selectedPiece !== null){
            setSelectedPieceCoordinate(selectedPiece?.location)
        } else{
            setSelectedPieceCoordinate(null)
        }
        console.log(selectedPiece)
    },[selectedPiece])

    function onMouseDown(){
        if(hoveredTile !== null){
            const hoveredTileOccupant = props.game.getTile(hoveredTile).occupant    
            setSelectedPiece(hoveredTileOccupant)
        }
    }

    function onMouseUp(){
        if(selectedPiece){
            if(hoveredTile !== null && JSON.stringify(hoveredTile) !== JSON.stringify(selectedPieceCoordinate)){
                if(selectedPiece.movableTo.length !== 0 && selectedPiece.movableTo.some(a=> hoveredTile?.every((v,i)=> v === a[i]))){
                    console.log("moving to")
                    selectedPiece.move(hoveredTile)
                }
            }
            setSelectedPiece(null)
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center p-0">
            <div 
                className="chessboard"
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            >
                {
                    props.game.tileMap.map((tile,index)=>{
                        const occupant = tile.occupant
                        const location = {
                            x:(index % props.game.rowLength),
                            y:Math.floor(index / props.game.rowLength),
                        }
                        return(
                            <ChessTile
                                        key={`key_chess-tile-${index}`}
                                        selectedPieceCoordinate={selectedPieceCoordinate}
                                        setHoveredTile={setHoveredTile}
                                        occupant={occupant}
                                        isDarkTile={(((index % props.game.rowLength) + 1) % 2 === 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 !== 0)) || (((index % props.game.rowLength) + 1) % 2 !== 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 === 0))}
                                        position={[location.x,location.y]}
                            />
                        )
                    })
                }

            </div>
        </Container>
    )
}

export default Chessboard
