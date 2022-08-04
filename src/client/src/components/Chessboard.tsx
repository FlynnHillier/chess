import React from 'react'
import "./../styles/chessboard.css"

import { Container } from 'react-bootstrap'
import {Board} from "chess-online-common"

import ChessTile from "./ChessTile"

interface Props {
    game:Board,
}


const Chessboard = (props:Props) => {
  return (
    <Container fluid className="d-flex justify-content-center p-0">
        <div className="chessboard">
            {
                props.game.tileMap.map((tile,index)=>{
                    return (
                        <ChessTile
                            key={`key_chess-tile-${index}`}
                            occupant={tile.occupant}
                            isDarkTile={(((index % props.game.rowLength) + 1) % 2 === 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 !== 0)) || (((index % props.game.rowLength) + 1) % 2 !== 0 && ((Math.floor(index / props.game.rowLength) + 1) % 2 === 0))}
                            style={{
                                "gridColumnStart":(index % props.game.rowLength) + 1,
                                "gridRowStart":Math.floor(index / props.game.rowLength) + 1,
                            }}
                        />
                    )
                })
            }
        </div>
    </Container>
  )
}

export default Chessboard
