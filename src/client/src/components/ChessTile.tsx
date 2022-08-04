import React from 'react'
import {Piece} from "chess-online-common"

interface Props {
    occupant:null | Piece
    isDarkTile:boolean
    style?:React.CSSProperties
}


const ChessTile = (props:Props) => {
  return (
    <div  
      className={`p-0 chess-tile chess-tile-${props.isDarkTile ? "dark" : "light"} ${props.occupant ? "occupied" : ""}`}
      style={props.style}
    >
      {
        props.occupant ? <img alt={`${props.occupant.perspective} ${props.occupant.species}`} src={require(`./../assets/chessPieceImage/${props.occupant.perspective}/${props.occupant.species}.png`)}/> : <></>
      }
    </div>
  )
}

export default ChessTile