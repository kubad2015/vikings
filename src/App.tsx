import { useEffect } from 'react'
import Phaser from 'phaser'
import { gameConfig } from './game/config'
import './App.css'

function App() {
  useEffect(() => {
    // Create the game instance
    const game = new Phaser.Game({
      ...gameConfig,
      parent: 'game-container',
      width: 800,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width: 800,
        height: 600
      }
    });

    // Cleanup on unmount
    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div className="game-container">
      <h1>Vikings</h1>
      <div 
        id="game-container" 
        style={{
          width: '800px',
          height: '600px',
          border: '4px solid #2c3e50',
          margin: '0 auto'
        }}
      ></div>
      <div className="controls-info">
        <h2>Controls</h2>
        <p>← → Arrow Keys: Move</p>
        <p>Spacebar: Jump</p>
        <p>C: Chop down trees</p>
        <p>P: Craft planks (4 wood → 1 plank)</p>
        <p>I: Craft pickaxe (3 planks → 1 pickaxe)</p>
        <p>M: Mine stone (2 stone + 30% coal + 25% iron)</p>
        <p>F: Craft furnace (1 stone → 1 furnace)</p>
        <p>L: Create stone platform (2 stone)</p>
        <p>B: Craft steel (1 iron + 1 coal + furnace → 1 steel)</p>
      </div>
    </div>
  )
}

export default App
