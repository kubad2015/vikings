import { useEffect } from 'react'
import Phaser from 'phaser'
import { gameConfig } from './game/config'
import './App.css'

function App() {
  useEffect(() => {
    // Create the game instance
    const game = new Phaser.Game(gameConfig)

    // Cleanup on unmount
    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div className="game-container">
      <h1>Vikings</h1>
      <div id="game-container"></div>
      <div className="controls-info">
        <h2>Controls</h2>
        <p>← → Arrow Keys: Move</p>
        <p>Spacebar: Jump</p>
      </div>
    </div>
  )
}

export default App
