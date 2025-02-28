import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { MenuScene } from './scenes/MenuScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, MainScene],
    transparent: false,
    clearBeforeRender: true,
    render: {
        pixelArt: false,
        antialias: true
    }
}; 