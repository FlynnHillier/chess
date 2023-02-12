import React,{useState} from 'react'
import {Species,Perspective} from "chess-online-common"


interface Props {
    species:Species,
    perspective:Perspective,
    imageOffset:{
      x:number,
      y:number
    }
}

export const ChessPiece = ({species,perspective,imageOffset}:Props) => {
  return (
    <div className="chess-piece">
        <img 
          style={{
            "left":`${imageOffset.x}px`,
            "top":`${imageOffset.y}px`
          }}
          draggable={false}
          src={`assets/images/chessPiece/${perspective}/${species}.png`} 
          alt={`${perspective} ${species}`}
        />

    </div>
  )
}
