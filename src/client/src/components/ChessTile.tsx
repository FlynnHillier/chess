import React, { ReactElement,useEffect,useState,useRef } from 'react'
import {Piece,Perspective, Species,Coordinate} from "chess-online-common"
import { ChessPiece } from './ChessPiece'
import {ImageLayers} from "./Chessboard"

interface Props {
    occupant:null | Piece
    position:Coordinate
    isDarkTile:boolean,
    setHoveredTile:(arg:Coordinate | null)=>void,
    focusedTileCoordinate:Coordinate | null,
    overlays:ImageLayers
    // highlight:{
    //     movableTo:boolean,
    //     moveDestination:boolean,
    // }
}


const ChessTile = ({occupant,position,isDarkTile,setHoveredTile,focusedTileCoordinate,overlays}:Props) => {
  let [originClientLocation,setOriginClientLocation] = useState<{x:number,y:number}>({x:-1,y:-1})
  let [isHovered,setIsHovered] = useState<boolean>(false)
  let [isFocused,setIsFocused] = useState<boolean>(JSON.stringify(focusedTileCoordinate) === JSON.stringify(position))


  let [pieceImageOffset,setPieceImageOffset] = useState<{x:number,y:number}>({x:0,y:0})

  useEffect(()=>{
    setIsFocused(JSON.stringify(focusedTileCoordinate) === JSON.stringify(position))
  },[focusedTileCoordinate])
  
  function onMouseEnter(){
    setHoveredTile(position)
  }
  
  function onMouseLeave(){
    setHoveredTile(null)
  }

  function onMouseMove(e:React.MouseEvent){
    if(isFocused){
      
    }
  }

  function onMouseDown(e:React.MouseEvent){
  }

  return (
    <div
      className={`chess-tile chess-tile-${isDarkTile ? "dark" : "light"} ${occupant ? "occupied" : ""} ${overlays.movableTo ? "movableTo" : ""}`}
      onMouseEnter={onMouseEnter}  
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      style={{
        "gridColumnStart":position[0] +1,
        "gridRowStart":position[1] + 1,
      }}
    >
      {overlays.focused ? <div className="overlay" style={{backgroundColor:"green"}}/>: <></>}
      {overlays.movableTo ? <img draggable={false} className="overlay"  src="assets/images/tileOverlays/movableTo.png" alt="movable to" style={{"zIndex":3}}/> : <></>}
      {occupant ? <ChessPiece imageOffset={pieceImageOffset} species={occupant.species} perspective={occupant.perspective}/> : <></>}
    </div>
  )
}

export default ChessTile