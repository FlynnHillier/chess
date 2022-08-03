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
            props.game.tileMap.map((tileRow,y_index)=>{
                return (
                    <>
                        {
                            tileRow.map((tile,x_index)=>{
                                return (
                                    <ChessTile
                                        key={`key_chess-tile-[${x_index},${y_index}]`}
                                        occupant={tile.occupant}
                                        text={x_index+" "+y_index}
                                        style={{
                                            "gridColumnStart":x_index + 1,
                                            "gridRowStart":y_index + 1,
                                        }}
                                    />
                                )
                            })
                        }
                    </>
                )
            })
        }
        </div>
    </Container>
  )
}

export default Chessboard
