import React, {useState, useEffect} from 'react'

import "./../styles/chessboard.css"

import { Container } from 'react-bootstrap'
import {Board,Piece,Coordinate} from "chess-online-common"

import ChessTile from "./ChessTile"

interface Props {
    game:Board,
}

export interface ImageLayers {
    movableTo:boolean,
    focused:boolean,
}

const Chessboard = (props:Props) => {
    let [hoveredTile,setHoveredTile] = useState<null | [number,number]>(null)
    let [focusedTileOccupant,setFocusedTileOccupant] = useState<null | Piece>(null)
    let [selectedPiece,setSelectedPiece] = useState<null | Piece>(null)
    let [selectedPieceCoordinate,setSelectedPieceCoordinate] = useState<null | Coordinate>(null)
    let [focusedPieceMovableTo,setFocusedPieceMovableTo] = useState<Coordinate[]>([])
    let [tileOverlaysMap,setTileOverlaysMap] = useState<ImageLayers[]>(props.game.tileMap.map(()=>{return {focused:false,movableTo:false}}))


    useEffect(()=>{
        if(selectedPiece !== null){
            setSelectedPieceCoordinate(selectedPiece?.location)
        } else{
            setSelectedPieceCoordinate(null)
        }
    },[selectedPiece])

    useEffect(()=>{
        if(focusedTileOccupant !== null){
            setTileOverlaysMap((prevTileOverlaysMap)=>{
                return prevTileOverlaysMap.map((tileOverlays,index)=>({...tileOverlays,focused: JSON.stringify(focusedTileOccupant!.location) === JSON.stringify(_indexToCoordinate(index))}))
            })
            setFocusedPieceMovableTo(props.game.getTile(focusedTileOccupant.location).occupant!.movableTo)
        } else{
            setTileOverlaysMap((prevTileOverlaysMap)=>{
                return prevTileOverlaysMap.map((tileOverlays)=>({...tileOverlays,focused: false}))
            })
            setFocusedPieceMovableTo([])
        }
    },[focusedTileOccupant,focusedTileOccupant?.location])


    useEffect(()=>{
        setTileOverlaysMap((prevTileOverlaysMap)=>{ //updates all 'movableTo' attributes for all imageLayers on 'focusedPieceMovableTo' change (to false if not included within movable to, true if is)
            return prevTileOverlaysMap.map((tileOverlays,index)=>({...tileOverlays,movableTo: focusedPieceMovableTo.some(a => _indexToCoordinate(index).every((v,i)=> v === a[i]))}))
        })
    },[focusedPieceMovableTo])
    
    function _indexToCoordinate(index:number) : Coordinate{
        return [
            index % props.game.rowLength,
            Math.floor(index / props.game.rowLength),
        ]
    }

    function onMouseDown(){
        if(hoveredTile !== null){
            const hoveredTileOccupant = props.game.getTile(hoveredTile).occupant 
            setFocusedTileOccupant(hoveredTileOccupant)   
            setSelectedPiece(hoveredTileOccupant)
        }
    }

    function onMouseUp(){
        if(selectedPiece){
            if(hoveredTile !== null && JSON.stringify(hoveredTile) !== JSON.stringify(selectedPieceCoordinate)){
                if(selectedPiece.movableTo.length !== 0 && selectedPiece.movableTo.some(a=> hoveredTile?.every((v,i)=> v === a[i]))){
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
                        const location = _indexToCoordinate(index)
                        return(
                            <ChessTile
                                        overlays={tileOverlaysMap[index]}
                                        key={`key_chess-tile-${index}`}
                                        selectedPieceCoordinate={selectedPieceCoordinate}
                                        setHoveredTile={setHoveredTile}
                                        occupant={occupant}
                                        isDarkTile={(((index % props.game.rowLength) + 1) % 2 === 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 !== 0)) || (((index % props.game.rowLength) + 1) % 2 !== 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 === 0))}
                                        position={location}
                            />
                        )
                    })
                }

            </div>
        </Container>
    )
}

export default Chessboard
