import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugText?: Phaser.GameObjects.Text;
    private spaceKey?: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Create colored rectangles for temporary sprites
        const graphics = this.add.graphics();
        
        // Brown platform (64x16)
        graphics.fillStyle(0x966F33);
        graphics.fillRect(0, 0, 400, 32); // Made platform wider and taller
        graphics.generateTexture('ground', 400, 32);
        graphics.clear();

        // Red player (32x32)
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player', 32, 32);
        graphics.destroy();
    }

    create() {
        // Add platforms
        this.platforms = this.physics.add.staticGroup();
        
        // Create the ground - made it bigger and positioned it better
        const ground = this.platforms.create(400, 580, 'ground');
        ground.setDisplaySize(800, 40); // Make ground span the whole width
        ground.refreshBody();

        // Create some platforms - made them bigger
        const platform1 = this.platforms.create(600, 400, 'ground');
        platform1.setDisplaySize(200, 32);
        platform1.refreshBody();

        const platform2 = this.platforms.create(200, 300, 'ground');
        platform2.setDisplaySize(200, 32);
        platform2.refreshBody();

        const platform3 = this.platforms.create(600, 200, 'ground');
        platform3.setDisplaySize(200, 32);
        platform3.refreshBody();

        // Create player with adjusted physics
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.1); // Reduced bounce
        this.player.setCollideWorldBounds(true);
        
        // Set player's body size and offset for better collision
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setSize(28, 30); // Slightly smaller than sprite
        body.setOffset(2, 1); // Center the hitbox

        // Add collision between player and platforms
        this.physics.add.collider(this.player, this.platforms);

        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add debug text
        this.debugText = this.add.text(16, 16, 'Debug info...', {
            fontSize: '18px',
            color: '#fff',
            backgroundColor: '#000'
        });
    }

    update() {
        if (!this.cursors || !this.player || !this.debugText || !this.spaceKey) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        // Handle jumping - made more responsive
        if (this.spaceKey.isDown && body.touching.down) {
            this.player.setVelocityY(-400); // Increased jump force
        }

        // Update debug text with more info
        this.debugText.setText([
            `Player x: ${Math.floor(this.player.x)}`,
            `Player y: ${Math.floor(this.player.y)}`,
            `Velocity x: ${Math.floor(body.velocity.x)}`,
            `Velocity y: ${Math.floor(body.velocity.y)}`,
            `On ground: ${body.touching.down}`,
            `Space pressed: ${this.spaceKey.isDown}`,
            `Can jump: ${body.touching.down && this.spaceKey.isDown}`,
            `Touching: ${JSON.stringify(body.touching)}`,
            `Blocked: ${JSON.stringify(body.blocked)}`
        ].join('\n'));
    }
} 
