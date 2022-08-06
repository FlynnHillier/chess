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
    let [tileOverlaysMap,setTileOverlaysMap] = useState<ImageLayers[]>(props.game.tileMap.map(()=>{return {focused:false,movableTo:false}}))
    let [hoveredTile,setHoveredTile] = useState<null | [number,number]>(null)

    let [focusedPiece,setFocusedPiece] = useState<null | Piece>(null)
    let [isDraggingPiece,setIsDraggingPiece] = useState<boolean>(false)

    function _arrayEquals(a:Array<any>,b:Array<any>){
        return JSON.stringify(a) === JSON.stringify(b)
    }

    function _arrayIncludesArray(parentArray:Array<any>,childArray:Array<any>){
        return childArray.length !== 0 && parentArray.some(a => childArray.every((v,i)=> v === a[i]))
    }

    function _indexToCoordinate(index:number) : Coordinate{
        return [
            index % props.game.rowLength,
            Math.floor(index / props.game.rowLength),
        ]
    }

    useEffect(()=>{ //updates focused tile overlay
        if(focusedPiece !== null){
            setTileOverlaysMap((prevTileOverlaysMap)=>{
                return prevTileOverlaysMap.map((tileOverlays,index)=>({...tileOverlays,focused: _arrayEquals(focusedPiece!.location,_indexToCoordinate(index))}))
            })
        } else{
            setTileOverlaysMap((prevTileOverlaysMap)=>{
                return prevTileOverlaysMap.map((tileOverlays)=>({...tileOverlays,focused: false}))
            })
        }
    },[focusedPiece?.location])


    useEffect(()=>{
        if(focusedPiece !== null){  //updates all 'movableTo' attributes for all imageLayers on 'focusedPieceMovableTo' change (to false if not included within movable to, true if is)
            setTileOverlaysMap((prevTileOverlaysMap)=>{
                return prevTileOverlaysMap.map((tileOverlays,index)=>({...tileOverlays,movableTo: _arrayIncludesArray(focusedPiece!.movableTo,_indexToCoordinate(index))}))
            })
        } else {
            setTileOverlaysMap((prevTileOverlaysMap)=>{ //sets all to false
                return prevTileOverlaysMap.map((tileOverlays)=>({...tileOverlays,movableTo: false}))
            })
        }   
    },[focusedPiece?.movableTo])



    

    function onMouseDown(){
        setIsDraggingPiece(false)
        if(hoveredTile !== null){
            if(focusedPiece && _arrayIncludesArray(focusedPiece.movableTo,hoveredTile)){
                focusedPiece.move(hoveredTile)
                setIsDraggingPiece(true) //!!!THIS SHOULD NOT BE HERE!!! is a temporary fix that forces state update to cause remap
                onPieceMove()
            } else {
                const hoveredTileOccupant = props.game.getTile(hoveredTile).occupant 
                setFocusedPiece(hoveredTileOccupant)   

                if(hoveredTileOccupant !== null){
                    setIsDraggingPiece(true)
                }
            }
        }
    }

    function onMouseUp(){
        if(isDraggingPiece && focusedPiece){
            setIsDraggingPiece(false)
            if(hoveredTile !== null && !_arrayEquals(hoveredTile,focusedPiece.location)){
                if(_arrayIncludesArray(focusedPiece.movableTo,hoveredTile)){
                    focusedPiece.move(hoveredTile)
                    onPieceMove()
                }
            }
        }
    }


    function onPieceMove(){

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
                                focusedTileCoordinate={focusedPiece?.location || null}
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
