import React, { ReactElement,useEffect } from 'react'
import {Image,Col,Container} from "react-bootstrap"
import {Piece,Perspective, Species} from "chess-online-common"

interface Props {
    occupant:null | Piece
    style?:React.CSSProperties
    text:string
}


const ChessTile = (props:Props) => {
  return (
    <div  
      className={`p-0 chess-tile ${props.occupant ? "occupied" : ""}`}
      style={props.style}
    >
      {/* {props.occupant ? `${props.occupant.perspective} ${props.occupant.species}` : "null"} */}
      {
        props.occupant ? <Image fluid src={require(`./../assets/chessPieceImage/${props.occupant.perspective}/${props.occupant.species}.png`)}/> : <></>
      }
    </div>
  )
}

export default ChessTile