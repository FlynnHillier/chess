import React, { ReactElement,useEffect,useState } from 'react'
import {Piece,Perspective, Species,Coordinate} from "chess-online-common"
import { ChessPiece } from './ChessPiece'

interface Props {
    occupant:null | Piece
    position:Coordinate
    isDarkTile:boolean,
    setHoveredTile:(arg:Coordinate | null)=>void,
    selectedPieceCoordinate:Coordinate | null
}


const ChessTile = ({occupant,position,isDarkTile,setHoveredTile,selectedPieceCoordinate}:Props) => {
  let [isSelected,setIsSelected] = useState<boolean>(JSON.stringify(selectedPieceCoordinate) === JSON.stringify(position))
  let [pieceImageOffset,setPieceImageOffset] = useState<{x:number,y:number}>({x:0,y:0})

  function onMouseEnter(){
    setHoveredTile(position)
  }
  
  function onMouseLeave(){
    setHoveredTile(null)
  }

  function onMouseMove(){
    if(isSelected){
      
    }
  }

  useEffect(()=>{
    setIsSelected(JSON.stringify(selectedPieceCoordinate) === JSON.stringify(position))
  },[selectedPieceCoordinate])

  return (
    <div
      className={`chess-tile chess-tile-${isDarkTile ? "dark" : "light"} ${occupant ? "occupied" : ""}`}
      onMouseEnter={onMouseEnter}  
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      style={{
        "gridColumnStart":position[0] +1,
        "gridRowStart":position[1] + 1,
      }}
    >
      {occupant ? <ChessPiece imageOffset={pieceImageOffset} species={occupant.species} perspective={occupant.perspective}/> : <></>}
    </div>
  )
}

export default ChessTile