import Phaser from 'phaser';

interface SavedWorld {
    name: string;
    date: string;
}

export class MenuScene extends Phaser.Scene {
    private savedWorlds: SavedWorld[] = [];
    private worldListContainer?: Phaser.GameObjects.Container;
    private isInWorldList: boolean = false;

    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data: { showNamePrompt?: boolean, worldName?: string }) {
        if (data.showNamePrompt) {
            // Use browser's prompt for name input
            const worldName = prompt('Name your world:', data.worldName || 'My World');
            if (worldName) {
                // Save the world
                this.savedWorlds.push({
                    name: worldName,
                    date: new Date().toLocaleDateString()
                });
                // Store in localStorage
                localStorage.setItem('savedWorlds', JSON.stringify(this.savedWorlds));
            }
        }
    }

    preload() {
        // Load saved worlds from localStorage
        const savedWorldsStr = localStorage.getItem('savedWorlds');
        if (savedWorldsStr) {
            this.savedWorlds = JSON.parse(savedWorldsStr);
        }

        // Create button textures
        const graphics = this.add.graphics();
        
        // Button texture
        graphics.fillStyle(0x4A90E2);
        graphics.fillRoundedRect(0, 0, 300, 60, 10);
        graphics.lineStyle(2, 0x2171B5);
        graphics.strokeRoundedRect(0, 0, 300, 60, 10);
        graphics.generateTexture('button', 300, 60);
        graphics.clear();

        // Button hover texture
        graphics.fillStyle(0x2171B5);
        graphics.fillRoundedRect(0, 0, 300, 60, 10);
        graphics.lineStyle(2, 0x4A90E2);
        graphics.strokeRoundedRect(0, 0, 300, 60, 10);
        graphics.generateTexture('button-hover', 300, 60);
        graphics.clear();

        // Delete button texture
        graphics.fillStyle(0xdc3545);
        graphics.fillRoundedRect(0, 0, 40, 40, 8);
        graphics.lineStyle(2, 0xb02a37);
        graphics.strokeRoundedRect(0, 0, 40, 40, 8);
        graphics.generateTexture('delete-button', 40, 40);
        graphics.clear();

        // Delete button hover texture
        graphics.fillStyle(0xb02a37);
        graphics.fillRoundedRect(0, 0, 40, 40, 8);
        graphics.lineStyle(2, 0xdc3545);
        graphics.strokeRoundedRect(0, 0, 40, 40, 8);
        graphics.generateTexture('delete-button-hover', 40, 40);
        graphics.clear();

        // World button texture (smaller)
        graphics.fillStyle(0x4A90E2);
        graphics.fillRoundedRect(0, 0, 400, 40, 8);
        graphics.lineStyle(2, 0x2171B5);
        graphics.strokeRoundedRect(0, 0, 400, 40, 8);
        graphics.generateTexture('world-button', 400, 40);
        graphics.clear();

        // World button hover texture
        graphics.fillStyle(0x2171B5);
        graphics.fillRoundedRect(0, 0, 400, 40, 8);
        graphics.lineStyle(2, 0x4A90E2);
        graphics.strokeRoundedRect(0, 0, 400, 40, 8);
        graphics.generateTexture('world-button-hover', 400, 40);
        graphics.clear();
    }

    showMainMenu() {
        this.isInWorldList = false;
        if (this.worldListContainer) {
            this.worldListContainer.destroy();
        }

        // Add title text
        const title = this.add.text(400, 100, 'Viking Adventure', {
            fontSize: '64px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(400, 180, 'Craft, Build, Survive!', {
            fontSize: '32px',
            color: '#90CAF9'
        });
        subtitle.setOrigin(0.5);

        // Create Play Worlds button
        const playButton = this.add.image(400, 300, 'button');
        const playText = this.add.text(400, 300, 'Play Worlds', {
            fontSize: '28px',
            color: '#FFFFFF'
        });
        playText.setOrigin(0.5);

        // Create New World button
        const newWorldButton = this.add.image(400, 400, 'button');
        const newWorldText = this.add.text(400, 400, 'Create New World', {
            fontSize: '28px',
            color: '#FFFFFF'
        });
        newWorldText.setOrigin(0.5);

        // Make buttons interactive
        [playButton, newWorldButton].forEach(button => {
            button.setInteractive();
            
            button.on('pointerover', () => {
                button.setTexture('button-hover');
            });
            
            button.on('pointerout', () => {
                button.setTexture('button');
            });
        });

        // Add click handlers
        playButton.on('pointerdown', () => {
            this.showWorldList();
        });

        newWorldButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        // Add version text
        const version = this.add.text(780, 580, 'v1.0.0', {
            fontSize: '16px',
            color: '#64B5F6'
        });
        version.setOrigin(1);
    }

    showWorldList() {
        this.isInWorldList = true;
        this.worldListContainer = this.add.container(0, 0);

        // Add title
        const title = this.add.text(400, 50, 'Select World', {
            fontSize: '48px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.worldListContainer.add(title);

        // Add back button
        const backButton = this.add.image(100, 50, 'button');
        backButton.setScale(0.3);
        const backText = this.add.text(100, 50, 'Back', {
            fontSize: '20px',
            color: '#FFFFFF'
        });
        backText.setOrigin(0.5);
        this.worldListContainer.add(backButton);
        this.worldListContainer.add(backText);

        backButton.setInteractive();
        backButton.on('pointerover', () => backButton.setTexture('button-hover'));
        backButton.on('pointerout', () => backButton.setTexture('button'));
        backButton.on('pointerdown', () => {
            this.scene.restart();
        });

        // Add world list
        if (this.savedWorlds.length === 0) {
            const noWorldsText = this.add.text(400, 300, 'No saved worlds found.\nCreate a new world to get started!', {
                fontSize: '24px',
                color: '#FFFFFF',
                align: 'center'
            });
            noWorldsText.setOrigin(0.5);
            this.worldListContainer.add(noWorldsText);
        } else {
            this.savedWorlds.forEach((world, index) => {
                const y = 150 + (index * 60);
                
                // World button
                const worldButton = this.add.image(400, y, 'world-button');
                const worldText = this.add.text(400, y, `${world.name} (${world.date})`, {
                    fontSize: '24px',
                    color: '#FFFFFF'
                });
                worldText.setOrigin(0.5);

                // Delete button
                const deleteButton = this.add.image(620, y, 'delete-button');
                const deleteText = this.add.text(620, y, '×', {
                    fontSize: '32px',
                    color: '#FFFFFF'
                });
                deleteText.setOrigin(0.5);

                worldButton.setInteractive();
                worldButton.on('pointerover', () => worldButton.setTexture('world-button-hover'));
                worldButton.on('pointerout', () => worldButton.setTexture('world-button'));
                worldButton.on('pointerdown', () => {
                    this.scene.start('MainScene', { worldName: world.name });
                });

                deleteButton.setInteractive();
                deleteButton.on('pointerover', () => {
                    deleteButton.setTexture('delete-button-hover');
                    deleteText.setColor('#FFD700');
                });
                deleteButton.on('pointerout', () => {
                    deleteButton.setTexture('delete-button');
                    deleteText.setColor('#FFFFFF');
                });
                deleteButton.on('pointerdown', () => {
                    if (confirm(`Are you sure you want to delete "${world.name}"?`)) {
                        // Remove the world from the array
                        this.savedWorlds = this.savedWorlds.filter(w => w.name !== world.name);
                        // Update localStorage
                        localStorage.setItem('savedWorlds', JSON.stringify(this.savedWorlds));
                        // Refresh the world list
                        this.scene.restart();
                    }
                });

                if (this.worldListContainer) {
                    this.worldListContainer.add(worldButton);
                    this.worldListContainer.add(worldText);
                    this.worldListContainer.add(deleteButton);
                    this.worldListContainer.add(deleteText);
                }
            });
        }
    }

    create() {
        // Add a gradient background
        const background = this.add.graphics();
        background.fillGradientStyle(0x1a237e, 0x1a237e, 0x0d47a1, 0x0d47a1, 1);
        background.fillRect(0, 0, 800, 600);

        this.showMainMenu();
    }
} 