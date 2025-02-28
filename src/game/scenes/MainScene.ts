import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private debugText?: Phaser.GameObjects.Text;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private cKey?: Phaser.Input.Keyboard.Key;
    private pKey?: Phaser.Input.Keyboard.Key;
    private iKey?: Phaser.Input.Keyboard.Key;
    private mKey?: Phaser.Input.Keyboard.Key;
    private lKey?: Phaser.Input.Keyboard.Key;
    private fKey?: Phaser.Input.Keyboard.Key;
    private bKey?: Phaser.Input.Keyboard.Key;
    private background?: Phaser.GameObjects.Graphics;
    private mountain1?: Phaser.GameObjects.Polygon;
    private mountain2?: Phaser.GameObjects.Polygon;
    private duck?: Phaser.GameObjects.Sprite;
    private splashSprite?: Phaser.GameObjects.Sprite;
    private wasInPond: boolean = false;
    private trees: { sprite: Phaser.GameObjects.Sprite; trunk: Phaser.Physics.Arcade.Sprite; topLower: Phaser.Physics.Arcade.Sprite; topUpper: Phaser.Physics.Arcade.Sprite }[] = [];
    private woodInBoxes: number[] = [0, 0, 0, 0, 0]; // Track wood in each box
    private planksInBoxes: number[] = [0, 0, 0, 0, 0]; // Track planks in each box
    private pickaxesInBoxes: number[] = [0, 0, 0, 0, 0]; // Track pickaxes in each box
    private stoneInBoxes: number[] = [0, 0, 0, 0, 0]; // Track stone in each box
    private coalInBoxes: number[] = [0, 0, 0, 0, 0]; // Track coal in each box
    private furnacesInBoxes: number[] = [0, 0, 0, 0, 0]; // Track furnaces in each box
    private ironInBoxes: number[] = [0, 0, 0, 0, 0]; // Track iron in each box
    private steelInBoxes: number[] = [0, 0, 0, 0, 0]; // Track steel in each box
    private boxSprites: Phaser.Physics.Arcade.Sprite[] = []; // Store box sprites
    private woodTexts: Phaser.GameObjects.Text[] = []; // Store wood count texts
    private plankTexts: Phaser.GameObjects.Text[] = []; // Store plank count texts
    private pickaxeTexts: Phaser.GameObjects.Text[] = []; // Store pickaxe count texts
    private stoneTexts: Phaser.GameObjects.Text[] = []; // Store stone count texts
    private coalTexts: Phaser.GameObjects.Text[] = []; // Store coal count texts
    private furnaceTexts: Phaser.GameObjects.Text[] = []; // Store furnace count texts
    private ironTexts: Phaser.GameObjects.Text[] = []; // Store iron count texts
    private steelTexts: Phaser.GameObjects.Text[] = []; // Store steel count texts
    private lastPressTime: number = 0; // To prevent rapid crafting
    private lastTreeTime: number = 0;

    constructor() {
        super({ key: 'MainScene' });
    }

    createMountainSteps(startX: number, startY: number, endX: number, endY: number, numSteps: number) {
        const stepWidth = 60;
        const stepHeight = 10;
        const xStep = (endX - startX) / numSteps;
        const yStep = (endY - startY) / numSteps;

        for (let i = 0; i < numSteps; i++) {
            const x = startX + (xStep * i);
            const y = startY + (yStep * i);
            const step = this.platforms?.create(x, y, 'ground');
            if (step) {
                step.setDisplaySize(stepWidth, stepHeight);
                step.refreshBody();
                step.setTint(0x808080); // Gray color for rock steps
            }
        }
    }

    preload() {
        // Create colored rectangles for temporary sprites
        const graphics = this.add.graphics();
        
        // Platform texture (now gray)
        graphics.fillStyle(0x808080);
        graphics.fillRect(0, 0, 400, 32);
        graphics.generateTexture('ground', 400, 32);
        graphics.clear();

        // Red player (32x32)
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player', 32, 32);
        graphics.clear();

        // Create a cute yellow duck (24x24)
        graphics.fillStyle(0xFFEB3B); // Yellow color
        graphics.fillRect(0, 0, 24, 24); // Duck body
        graphics.fillStyle(0xFF9800); // Orange color
        graphics.fillRect(18, 8, 6, 4);  // Duck beak
        graphics.generateTexture('duck', 24, 24);
        graphics.clear();

        // Create tree sprite (48x64)
        graphics.fillStyle(0x2E7D32); // Dark green for tree
        graphics.fillTriangle(24, 0, 0, 32, 48, 32); // Top triangle
        graphics.fillTriangle(24, 16, 0, 48, 48, 48); // Middle triangle
        graphics.fillStyle(0x795548); // Brown for trunk
        graphics.fillRect(20, 48, 8, 16); // Trunk
        graphics.generateTexture('tree', 48, 64);
        graphics.clear();

        // Create splash sprite (32x32)
        graphics.fillStyle(0x4169E1);
        graphics.fillRect(0, 0, 8, 16);
        graphics.fillRect(8, 0, 8, 12);
        graphics.fillRect(16, 0, 8, 16);
        graphics.generateTexture('splash', 32, 32);
        graphics.clear();

        // Create wood texture
        graphics.fillStyle(0x8B4513); // Brown wood color
        graphics.fillRect(0, 0, 400, 32);
        graphics.generateTexture('wood', 400, 32);
        graphics.clear();

        // Create pickaxe texture (24x24)
        graphics.lineStyle(3, 0x8B4513); // Brown handle
        graphics.lineBetween(12, 12, 12, 24); // Handle
        graphics.fillStyle(0x808080); // Gray for metal head
        graphics.fillTriangle(4, 4, 20, 4, 12, 12); // Pickaxe head
        graphics.generateTexture('pickaxe', 24, 24);
        graphics.clear();

        // Create stone texture (24x24)
        graphics.fillStyle(0x808080); // Gray for stone
        graphics.fillRect(0, 0, 24, 24);
        graphics.lineStyle(2, 0x666666); // Darker gray for details
        graphics.lineBetween(4, 12, 20, 12);
        graphics.lineBetween(8, 4, 8, 20);
        graphics.generateTexture('stone', 24, 24);
        graphics.clear();

        // Create platform texture (32x8)
        graphics.fillStyle(0x666666); // Dark gray for stone platform
        graphics.fillRect(0, 0, 32, 8);
        graphics.lineStyle(1, 0x808080); // Light gray edges
        graphics.strokeRect(0, 0, 32, 8);
        graphics.generateTexture('stone_platform', 32, 8);
        graphics.clear();

        // Create coal texture (24x24)
        graphics.fillStyle(0x1a1a1a); // Very dark gray for coal
        graphics.fillRect(0, 0, 24, 24);
        graphics.lineStyle(2, 0x333333); // Slightly lighter gray for details
        graphics.lineBetween(4, 12, 20, 12);
        graphics.lineBetween(12, 4, 12, 20);
        graphics.generateTexture('coal', 24, 24);
        graphics.clear();

        // Create furnace texture (24x24)
        graphics.fillStyle(0x8B4513); // Brown base
        graphics.fillRect(0, 0, 24, 24);
        graphics.fillStyle(0xFF4500); // Orange-red for fire
        graphics.fillRect(8, 8, 8, 8);
        graphics.lineStyle(2, 0x666666); // Gray outline
        graphics.strokeRect(0, 0, 24, 24);
        graphics.generateTexture('furnace', 24, 24);
        graphics.clear();

        // Create iron texture (24x24)
        graphics.fillStyle(0xC0C0C0); // Silver color for iron
        graphics.fillRect(0, 0, 24, 24);
        graphics.lineStyle(2, 0x808080); // Gray details
        graphics.lineBetween(6, 12, 18, 12);
        graphics.lineBetween(12, 6, 12, 18);
        graphics.generateTexture('iron', 24, 24);
        graphics.clear();

        // Create steel texture (24x24)
        graphics.fillStyle(0x4682B4); // Steel blue color
        graphics.fillRect(0, 0, 24, 24);
        graphics.lineStyle(2, 0x363636); // Darker details
        graphics.lineBetween(4, 12, 20, 12);
        graphics.lineBetween(12, 4, 12, 20);
        graphics.generateTexture('steel', 24, 24);
        graphics.clear();
    }

    create() {
        // Create a blue sky background
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

        // Add platforms
        this.platforms = this.physics.add.staticGroup();
        
        // Create black borders at top and bottom
        const topBorder = this.platforms.create(400, 10, 'ground');
        topBorder.setDisplaySize(800, 20);
        topBorder.refreshBody();
        topBorder.setTint(0x000000); // Black color

        // Create five boxes at the top with all resource counters
        const boxSize = 60;
        const boxY = 50;
        const startX = 400 - (boxSize * 2.5);
        
        for (let i = 0; i < 5; i++) {
            const box = this.platforms?.create(startX + (i * boxSize), boxY, 'ground');
            if (box) {
                box.setDisplaySize(boxSize, boxSize);
                box.setTint(0x808080);
                box.refreshBody();
                this.boxSprites.push(box as Phaser.Physics.Arcade.Sprite);

                // Add wood counter text (top)
                const woodText = this.add.text(startX + (i * boxSize), boxY - boxSize/2, '', {
                    fontSize: '24px',
                    color: '#8B4513',
                    backgroundColor: '#FFFFFF'
                });
                woodText.setOrigin(0.5);
                this.woodTexts.push(woodText);

                // Add plank counter text (upper middle)
                const plankText = this.add.text(startX + (i * boxSize), boxY - boxSize/6, '', {
                    fontSize: '24px',
                    color: '#DEB887',
                    backgroundColor: '#FFFFFF'
                });
                plankText.setOrigin(0.5);
                this.plankTexts.push(plankText);

                // Add pickaxe counter text (lower middle)
                const pickaxeText = this.add.text(startX + (i * boxSize), boxY + boxSize/6, '', {
                    fontSize: '24px',
                    color: '#808080',
                    backgroundColor: '#FFFFFF'
                });
                pickaxeText.setOrigin(0.5);
                this.pickaxeTexts.push(pickaxeText);

                // Add stone counter text (bottom)
                const stoneText = this.add.text(startX + (i * boxSize), boxY + boxSize/2, '', {
                    fontSize: '24px',
                    color: '#666666',
                    backgroundColor: '#FFFFFF'
                });
                stoneText.setOrigin(0.5);
                this.stoneTexts.push(stoneText);

                // Add coal counter text (below stone)
                const coalText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 15, '', {
                    fontSize: '24px',
                    color: '#1a1a1a',
                    backgroundColor: '#FFFFFF'
                });
                coalText.setOrigin(0.5);
                this.coalTexts.push(coalText);

                // Add furnace counter text (below coal)
                const furnaceText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 30, '', {
                    fontSize: '24px',
                    color: '#8B4513',
                    backgroundColor: '#FFFFFF'
                });
                furnaceText.setOrigin(0.5);
                this.furnaceTexts.push(furnaceText);

                // Add iron counter text (below furnace)
                const ironText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 45, '', {
                    fontSize: '24px',
                    color: '#C0C0C0',
                    backgroundColor: '#FFFFFF'
                });
                ironText.setOrigin(0.5);
                this.ironTexts.push(ironText);

                // Add steel counter text (below iron)
                const steelText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 60, '', {
                    fontSize: '24px',
                    color: '#4682B4',
                    backgroundColor: '#FFFFFF'
                });
                steelText.setOrigin(0.5);
                this.steelTexts.push(steelText);
            }
        }

        const bottomBorder = this.platforms.create(400, 590, 'ground');
        bottomBorder.setDisplaySize(800, 20);
        bottomBorder.refreshBody();
        bottomBorder.setTint(0x000000); // Black color

        // Create the ground platforms first
        const groundY = 580;
        for (let x = 0; x < 800; x += 200) {
            const ground = this.platforms.create(x + 100, groundY, 'ground');
            ground.setDisplaySize(220, 40);
            ground.refreshBody();
            ground.setTint(0x808080); // Gray ground
        }

        // Create the mountains as visual objects only (no physics)
        // First mountain (left)
        const mountain1Points = [
            0, 300,     // Left base point
            200, 0,     // Peak
            400, 300    // Right base point
        ];
        this.mountain1 = this.add.polygon(100, 430, mountain1Points, 0x000000);
        
        // Add base collision for first mountain
        const mountain1Base = this.platforms.create(100, 580, 'ground');
        mountain1Base.setDisplaySize(400, 20);
        mountain1Base.refreshBody();
        mountain1Base.setTint(0x808080);
        
        // Add steps to first mountain
        // Left side steps
        this.createMountainSteps(0, 500, 100, 300, 6);
        // Right side steps
        this.createMountainSteps(200, 500, 100, 300, 6);
        
        // Add a pond in the middle
        const pondGraphics = this.add.graphics();
        pondGraphics.fillStyle(0x4169E1, 1); // Royal blue color
        pondGraphics.fillEllipse(400, 550, 150, 40); // x, y, width, height

        // Create splash sprite (hidden initially)
        this.splashSprite = this.add.sprite(400, 550, 'splash');
        this.splashSprite.setVisible(false);
        this.splashSprite.setDepth(1);

        // Create the duck (hidden initially)
        this.duck = this.add.sprite(400, 550, 'duck');
        this.duck.setVisible(false);
        this.duck.setDepth(1); // Make sure duck renders above pond

        // Second mountain (right) - taller
        const mountain2Points = [
            0, 400,     // Left base point
            200, 0,     // Peak
            400, 400    // Right base point
        ];
        this.mountain2 = this.add.polygon(700, 380, mountain2Points, 0x000000);

        // Add base collision for second mountain
        const mountain2Base = this.platforms.create(700, 580, 'ground');
        mountain2Base.setDisplaySize(400, 20);
        mountain2Base.refreshBody();
        mountain2Base.setTint(0x808080);

        // Add steps to second mountain
        // Left side steps
        this.createMountainSteps(600, 500, 700, 250, 8);
        // Right side steps
        this.createMountainSteps(800, 500, 700, 250, 8);

        // Create player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        
        // Set player's body size and offset for better collision
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setSize(28, 30);
        body.setOffset(2, 1);

        // Add collision between player and platforms
        this.physics.add.collider(this.player, this.platforms);

        // Add trees AFTER player creation
        this.createTrees();

        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

        // Add debug text
        this.debugText = this.add.text(16, 16, 'Debug info...', {
            fontSize: '18px',
            color: '#fff',
            backgroundColor: '#000'
        });
    }

    private createSingleTree(x: number, y: number) {
        if (!this.player) return;

        // Create visual tree sprite
        const tree = this.add.sprite(x, y, 'tree');
        tree.setDepth(0.5);
        const scale = 1.2;
        tree.setScale(scale);
        tree.setTint(0x2E7D32);

        // Create static physics bodies for tree parts
        const trunk = this.physics.add.staticImage(x, y + 24, 'ground');
        trunk.setDisplaySize(16 * scale, 16 * scale);
        trunk.setTint(0x795548);
        trunk.refreshBody();

        const topLower = this.physics.add.staticImage(x, y + 8, 'ground');
        topLower.setDisplaySize(48 * scale, 16 * scale);
        topLower.setAlpha(0.5);
        topLower.refreshBody();

        const topUpper = this.physics.add.staticImage(x, y - 16, 'ground');
        topUpper.setDisplaySize(32 * scale, 16 * scale);
        topUpper.setAlpha(0.5);
        topUpper.refreshBody();

        // Add colliders
        this.physics.add.collider(this.player, trunk);
        this.physics.add.collider(this.player, topLower);
        this.physics.add.collider(this.player, topUpper);

        // Store all parts of the tree
        this.trees.push({
            sprite: tree,
            trunk: trunk as unknown as Phaser.Physics.Arcade.Sprite,
            topLower: topLower as unknown as Phaser.Physics.Arcade.Sprite,
            topUpper: topUpper as unknown as Phaser.Physics.Arcade.Sprite
        });
    }

    private createTrees() {
        // Add initial trees
        const treePositions = [
            { x: 150, y: 550 },
            { x: 650, y: 550 },
            { x: 400, y: 550 }
        ];

        treePositions.forEach(pos => {
            this.createSingleTree(pos.x, pos.y);
        });
    }

    private addWoodToBoxes() {
        // Find the first box that isn't full (less than 64 wood)
        for (let i = 0; i < this.woodInBoxes.length; i++) {
            if (this.woodInBoxes[i] < 64) {
                this.woodInBoxes[i] += 5;
                if (this.woodInBoxes[i] > 64) this.woodInBoxes[i] = 64;
                
                // Update the wood counter text
                if (this.woodTexts[i]) {
                    this.woodTexts[i].setText(this.woodInBoxes[i] > 0 ? this.woodInBoxes[i].toString() : '');
                }
                
                // Change box tint based on wood amount
                if (this.boxSprites[i]) {
                    const fillPercentage = this.woodInBoxes[i] / 64;
                    const brownTint = 0x8B4513;
                    const grayTint = 0x808080;
                    this.boxSprites[i].setTint(fillPercentage >= 1 ? brownTint : grayTint);
                }
                break;
            }
        }
    }

    private craftPlanks() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with enough wood for planks
        for (let i = 0; i < this.woodInBoxes.length; i++) {
            if (this.woodInBoxes[i] >= 4 && this.planksInBoxes[i] < 64) {
                // Convert 4 wood to 1 plank in the same box
                this.woodInBoxes[i] -= 4;
                this.planksInBoxes[i] += 1;

                // Update wood counter
                if (this.woodTexts[i]) {
                    this.woodTexts[i].setText(this.woodInBoxes[i] > 0 ? this.woodInBoxes[i].toString() : '');
                }

                // Update plank counter
                if (this.plankTexts[i]) {
                    this.plankTexts[i].setText(this.planksInBoxes[i] > 0 ? this.planksInBoxes[i].toString() : '');
                }

                // Update box color
                this.updateBoxColor(i);
                break;
            }
        }
    }

    private craftPickaxe() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with enough planks for a pickaxe
        for (let i = 0; i < this.planksInBoxes.length; i++) {
            if (this.planksInBoxes[i] >= 3 && this.pickaxesInBoxes[i] < 64) {
                // Convert 3 planks to 1 pickaxe in the same box
                this.planksInBoxes[i] -= 3;
                this.pickaxesInBoxes[i] += 1;

                // Update plank counter
                if (this.plankTexts[i]) {
                    this.plankTexts[i].setText(this.planksInBoxes[i] > 0 ? this.planksInBoxes[i].toString() : '');
                }

                // Update pickaxe counter
                if (this.pickaxeTexts[i]) {
                    this.pickaxeTexts[i].setText(this.pickaxesInBoxes[i] > 0 ? this.pickaxesInBoxes[i].toString() : '');
                }

                // Update box color
                this.updateBoxColor(i);
                break;
            }
        }
    }

    private mineStone() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid mining
        this.lastPressTime = currentTime;

        // Check if player is near a mountain and has a pickaxe
        const playerX = this.player?.x || 0;
        const playerY = this.player?.y || 0;
        
        const inMountain1 = (
            playerX >= 0 && playerX <= 200 &&
            playerY >= 300 && playerY <= 500
        );
        
        const inMountain2 = (
            playerX >= 600 && playerX <= 800 &&
            playerY >= 250 && playerY <= 500
        );

        if ((inMountain1 || inMountain2) && this.player?.body?.touching.down) {
            // Find first box with a pickaxe
            for (let i = 0; i < this.pickaxesInBoxes.length; i++) {
                if (this.pickaxesInBoxes[i] > 0) {
                    // Use up one pickaxe
                    this.pickaxesInBoxes[i]--;
                    this.pickaxeTexts[i].setText(this.pickaxesInBoxes[i] > 0 ? this.pickaxesInBoxes[i].toString() : '');

                    // Add stone to the next box
                    const nextBox = (i + 1) % this.stoneInBoxes.length;
                    if (this.stoneInBoxes[nextBox] < 64) {
                        this.stoneInBoxes[nextBox] += 2;
                        if (this.stoneInBoxes[nextBox] > 64) this.stoneInBoxes[nextBox] = 64;
                        this.stoneTexts[nextBox].setText(this.stoneInBoxes[nextBox] > 0 ? this.stoneInBoxes[nextBox].toString() : '');

                        // 30% chance to get coal
                        if (Math.random() < 0.3 && this.coalInBoxes[nextBox] < 64) {
                            this.coalInBoxes[nextBox] += 1;
                            if (this.coalInBoxes[nextBox] > 64) this.coalInBoxes[nextBox] = 64;
                            this.coalTexts[nextBox].setText(this.coalInBoxes[nextBox] > 0 ? this.coalInBoxes[nextBox].toString() : '');
                        }

                        // 25% chance to get iron
                        if (Math.random() < 0.25 && this.ironInBoxes[nextBox] < 64) {
                            this.ironInBoxes[nextBox] += 1;
                            if (this.ironInBoxes[nextBox] > 64) this.ironInBoxes[nextBox] = 64;
                            this.ironTexts[nextBox].setText(this.ironInBoxes[nextBox] > 0 ? this.ironInBoxes[nextBox].toString() : '');
                        }

                        this.updateBoxColor(nextBox);
                    }

                    // Update box colors
                    this.updateBoxColor(i);
                    break;
                }
            }
        }
    }

    private craftFurnace() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with enough stone for a furnace
        for (let i = 0; i < this.stoneInBoxes.length; i++) {
            if (this.stoneInBoxes[i] >= 1 && this.furnacesInBoxes[i] < 64) {
                // Convert 1 stone to 1 furnace in the same box
                this.stoneInBoxes[i] -= 1;
                this.furnacesInBoxes[i] += 1;

                // Update stone counter
                if (this.stoneTexts[i]) {
                    this.stoneTexts[i].setText(this.stoneInBoxes[i] > 0 ? this.stoneInBoxes[i].toString() : '');
                }

                // Update furnace counter
                if (this.furnaceTexts[i]) {
                    this.furnaceTexts[i].setText(this.furnacesInBoxes[i] > 0 ? this.furnacesInBoxes[i].toString() : '');
                }

                // Update box color
                this.updateBoxColor(i);
                break;
            }
        }
    }

    private craftSteel() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with iron, coal, and a furnace
        for (let i = 0; i < this.ironInBoxes.length; i++) {
            if (this.ironInBoxes[i] >= 1 && this.coalInBoxes[i] >= 1 && this.furnacesInBoxes[i] >= 1 && this.steelInBoxes[i] < 64) {
                // Convert 1 iron + 1 coal using furnace to make 1 steel
                this.ironInBoxes[i] -= 1;
                this.coalInBoxes[i] -= 1;
                this.steelInBoxes[i] += 1;

                // Update iron counter
                if (this.ironTexts[i]) {
                    this.ironTexts[i].setText(this.ironInBoxes[i] > 0 ? this.ironInBoxes[i].toString() : '');
                }

                // Update coal counter
                if (this.coalTexts[i]) {
                    this.coalTexts[i].setText(this.coalInBoxes[i] > 0 ? this.coalInBoxes[i].toString() : '');
                }

                // Update steel counter
                if (this.steelTexts[i]) {
                    this.steelTexts[i].setText(this.steelInBoxes[i] > 0 ? this.steelInBoxes[i].toString() : '');
                }

                // Update box color
                this.updateBoxColor(i);
                break;
            }
        }
    }

    private updateBoxColor(index: number) {
        if (this.boxSprites[index]) {
            const woodFull = this.woodInBoxes[index] >= 64;
            const planksFull = this.planksInBoxes[index] >= 64;
            const pickaxesFull = this.pickaxesInBoxes[index] >= 64;
            const stoneFull = this.stoneInBoxes[index] >= 64;
            const coalFull = this.coalInBoxes[index] >= 64;
            const furnacesFull = this.furnacesInBoxes[index] >= 64;
            const ironFull = this.ironInBoxes[index] >= 64;
            const steelFull = this.steelInBoxes[index] >= 64;
            const hasWood = this.woodInBoxes[index] > 0;
            const hasPlanks = this.planksInBoxes[index] > 0;
            const hasPickaxes = this.pickaxesInBoxes[index] > 0;
            const hasStone = this.stoneInBoxes[index] > 0;
            const hasCoal = this.coalInBoxes[index] > 0;
            const hasFurnaces = this.furnacesInBoxes[index] > 0;
            const hasIron = this.ironInBoxes[index] > 0;
            const hasSteel = this.steelInBoxes[index] > 0;
            
            if (woodFull && planksFull && pickaxesFull && stoneFull && coalFull && furnacesFull && ironFull && steelFull) {
                this.boxSprites[index].setTint(0x4A0404); // Very dark red (full everything)
            } else if (steelFull) {
                this.boxSprites[index].setTint(0x4682B4); // Steel blue for steel
            } else if (ironFull) {
                this.boxSprites[index].setTint(0xC0C0C0); // Silver for iron
            } else if (furnacesFull) {
                this.boxSprites[index].setTint(0x8B4513); // Brown for furnaces
            } else if (coalFull) {
                this.boxSprites[index].setTint(0x1a1a1a); // Very dark gray for coal
            } else if (stoneFull) {
                this.boxSprites[index].setTint(0x666666); // Dark gray for stone
            } else if (pickaxesFull) {
                this.boxSprites[index].setTint(0x696969); // Dim gray for pickaxes
            } else if (woodFull && planksFull) {
                this.boxSprites[index].setTint(0xA0522D); // Sienna (wood + planks)
            } else if (planksFull) {
                this.boxSprites[index].setTint(0xDEB887); // Light brown for planks
            } else if (woodFull) {
                this.boxSprites[index].setTint(0x8B4513); // Dark brown for wood
            } else if (hasWood || hasPlanks || hasPickaxes || hasStone || hasCoal || hasFurnaces || hasIron || hasSteel) {
                this.boxSprites[index].setTint(0xCD853F); // Peru (has items)
            } else {
                this.boxSprites[index].setTint(0x808080); // Gray for empty
            }
        }
    }

    private createPlatform() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid platform creation
        this.lastPressTime = currentTime;

        if (!this.player || !this.platforms) return;

        // Find first box with enough stone
        for (let i = 0; i < this.stoneInBoxes.length; i++) {
            if (this.stoneInBoxes[i] >= 2) {
                // Create platform above player
                const platformX = this.player.x;
                const platformY = this.player.y - 40; // Place platform above player

                // Create the platform
                const platform = this.platforms.create(platformX, platformY, 'stone_platform');
                platform.setDisplaySize(60, 10);
                platform.refreshBody();
                platform.setTint(0x666666);

                // Use up stone
                this.stoneInBoxes[i] -= 2;
                this.stoneTexts[i].setText(this.stoneInBoxes[i] > 0 ? this.stoneInBoxes[i].toString() : '');
                this.updateBoxColor(i);

                // Add a fade-in effect
                platform.setAlpha(0);
                this.tweens.add({
                    targets: platform,
                    alpha: 1,
                    duration: 200,
                    ease: 'Power1'
                });

                break;
            }
        }
    }

    update() {
        if (!this.cursors || !this.player || !this.debugText || !this.spaceKey || 
            !this.mountain1 || !this.mountain2 || !this.duck || !this.splashSprite || 
            !this.cKey || !this.pKey || !this.iKey || !this.mKey || !this.lKey || !this.fKey || !this.bKey) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Check if player is inside either mountain's bounding box
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Mountain 1 bounds (left mountain)
        const inMountain1 = (
            playerX >= 0 && playerX <= 200 && // X bounds for first mountain
            playerY >= 300 && playerY <= 500    // Y bounds for first mountain
        );
        
        // Mountain 2 bounds (right mountain)
        const inMountain2 = (
            playerX >= 600 && playerX <= 800 && // X bounds for second mountain
            playerY >= 250 && playerY <= 500    // Y bounds for second mountain
        );

        // Check if player is in the pond (ellipse detection)
        const inPond = this.isInPond(playerX, playerY);

        // Handle splash effect when entering pond
        if (inPond && !this.wasInPond && body.velocity.y > 0) {
            // Player is falling into the pond
            this.splashSprite.setPosition(playerX, playerY + 16);
            this.splashSprite.setVisible(true);
            this.splashSprite.setScale(1);
            this.splashSprite.setAlpha(1);
            
            // Animate the splash
            this.tweens.add({
                targets: this.splashSprite,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    if (this.splashSprite) {
                        this.splashSprite.setVisible(false);
                    }
                }
            });
        }
        this.wasInPond = inPond;

        // Show/hide duck based on player position
        this.duck.setVisible(inPond);
        if (inPond) {
            // Make the duck bob up and down slightly
            this.duck.y = 550 + Math.sin(this.time.now / 300) * 3;
        }

        // Handle player color based on location
        if (inPond) {
            this.player.setTint(0x00FF00); // Bright green in pond
        } else if (inMountain1 || inMountain2) {
            this.player.setTint(0x222222); // Very dark gray in mountains
        } else {
            this.player.clearTint(); // Normal red color outside
        }

        // Handle tree deletion
        if (this.cKey.isDown && this.player.body) {
            const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
            
            // Check each tree
            for (let i = this.trees.length - 1; i >= 0; i--) {
                const tree = this.trees[i];
                // Check if touching any part of the tree
                if (playerBody.touching.down && 
                    (playerBody.position.x >= tree.trunk.x - tree.trunk.width/2 && 
                     playerBody.position.x <= tree.trunk.x + tree.trunk.width/2 ||
                     playerBody.position.x >= tree.topLower.x - tree.topLower.width/2 && 
                     playerBody.position.x <= tree.topLower.x + tree.topLower.width/2 ||
                     playerBody.position.x >= tree.topUpper.x - tree.topUpper.width/2 && 
                     playerBody.position.x <= tree.topUpper.x + tree.topUpper.width/2)) {
                    // Delete all parts of the tree
                    tree.sprite.destroy();
                    tree.trunk.destroy();
                    tree.topLower.destroy();
                    tree.topUpper.destroy();
                    this.trees.splice(i, 1);
                    
                    // Add wood to boxes when tree is destroyed
                    this.addWoodToBoxes();
                }
            }
        }

        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        // Handle jumping
        if (this.spaceKey.isDown && body.touching.down) {
            this.player.setVelocityY(-400);
        }

        // Handle plank crafting
        if (this.pKey.isDown) {
            this.craftPlanks();
        }

        // Handle pickaxe crafting
        if (this.iKey.isDown) {
            this.craftPickaxe();
        }

        // Handle stone mining
        if (this.mKey.isDown) {
            this.mineStone();
        }

        // Handle platform creation
        if (this.lKey.isDown) {
            this.createPlatform();
        }

        // Handle furnace crafting
        if (this.fKey.isDown) {
            this.craftFurnace();
        }

        // Handle steel crafting
        if (this.bKey.isDown) {
            this.craftSteel();
        }

        // Check if it's time to create a new tree (every 30 seconds)
        const currentTime = this.time.now;
        if (currentTime - this.lastTreeTime >= 30000) { // 30000ms = 30 seconds
            // Generate a random x position that's not too close to mountains or pond
            let x;
            do {
                x = Phaser.Math.Between(100, 700);
            } while (
                (x > 350 && x < 450) || // Avoid pond area
                (x < 200) || // Avoid left mountain
                (x > 600)    // Avoid right mountain
            );
            
            this.createSingleTree(x, 550);
            this.lastTreeTime = currentTime;
        }

        // Update debug text with mountain and pond info
        this.debugText.setText([
            `Player x: ${Math.floor(this.player.x)}`,
            `Player y: ${Math.floor(this.player.y)}`,
            `In mountain 1: ${inMountain1}`,
            `In mountain 2: ${inMountain2}`,
            `In pond: ${inPond}`,
            `On ground: ${body.touching.down}`,
            `Space pressed: ${this.spaceKey.isDown}`,
            `Can jump: ${body.touching.down && this.spaceKey.isDown}`
        ].join('\n'));
    }

    private isInPond(x: number, y: number): boolean {
        // Pond is at (400, 550) with width 150 and height 40
        const pondX = 400;
        const pondY = 550;
        const pondWidth = 150;
        const pondHeight = 40;

        // Calculate if point is inside ellipse using the standard ellipse equation
        const normalizedX = (x - pondX) / (pondWidth / 2);
        const normalizedY = (y - pondY) / (pondHeight / 2);
        return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    }
} 
