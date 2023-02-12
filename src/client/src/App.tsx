import { ChessBoard, Rook,Bishop,King,Pawn, Coordinate } from 'chess-online-common';
import React from 'react';
import Chess from "./components/Chessboard"

function App() {

  function tempInit(){
    const x = new ChessBoard("white")
    x.init()
    return x
  }
  
  const game = tempInit() 
  const pieceRef = game.getTile([2,0]).occupant

  return (
    <div className="App">
      <header className="App-header">
          <Chess
            game={game}
          />
          <button
          onClick={()=>{
            console.log(pieceRef?.isRelatingVector([0,1]))
            console.log(game.getTile([0,1]).occupant)
          }}>
            display tilemap
          </button>
      </header>
    </div>
  );
}

export default App;
