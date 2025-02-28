import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: MainScene,
    transparent: false,
    clearBeforeRender: true,
    render: {
        pixelArt: false,
        antialias: true
    }
}; 