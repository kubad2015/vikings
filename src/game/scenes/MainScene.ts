import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private escKey?: Phaser.Input.Keyboard.Key;
    private cKey?: Phaser.Input.Keyboard.Key;
    private pKey?: Phaser.Input.Keyboard.Key;
    private iKey?: Phaser.Input.Keyboard.Key;
    private mKey?: Phaser.Input.Keyboard.Key;
    private lKey?: Phaser.Input.Keyboard.Key;
    private fKey?: Phaser.Input.Keyboard.Key;
    private bKey?: Phaser.Input.Keyboard.Key;
    private sKey?: Phaser.Input.Keyboard.Key;
    private aKey?: Phaser.Input.Keyboard.Key;
    private xKey?: Phaser.Input.Keyboard.Key;
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
    private armorInBoxes: number[] = [0, 0, 0, 0, 0]; // Track armor in each box
    private swordInBoxes: number[] = [0, 0, 0, 0, 0]; // Track swords in each box
    private boxSprites: Phaser.Physics.Arcade.Sprite[] = []; // Store box sprites
    private woodTexts: Phaser.GameObjects.Text[] = []; // Store wood count texts
    private plankTexts: Phaser.GameObjects.Text[] = []; // Store plank count texts
    private pickaxeTexts: Phaser.GameObjects.Text[] = []; // Store pickaxe count texts
    private stoneTexts: Phaser.GameObjects.Text[] = []; // Store stone count texts
    private coalTexts: Phaser.GameObjects.Text[] = []; // Store coal count texts
    private furnaceTexts: Phaser.GameObjects.Text[] = []; // Store furnace count texts
    private ironTexts: Phaser.GameObjects.Text[] = []; // Store iron count texts
    private steelTexts: Phaser.GameObjects.Text[] = []; // Store steel count texts
    private armorTexts: Phaser.GameObjects.Text[] = []; // Store armor count texts
    private swordTexts: Phaser.GameObjects.Text[] = []; // Store sword count texts
    private lastPressTime: number = 0; // To prevent rapid crafting
    private lastTreeTime: number = 0;
    private playerHP: number = 100;
    private maxPlayerHP: number = 100;
    private hpText?: Phaser.GameObjects.Text;
    private hpBar?: Phaser.GameObjects.Graphics;
    private zombies: Phaser.Physics.Arcade.Group;
    private lastZombieSpawnTime: number = 0;
    private zombieSpawnInterval: number = 15000; // Spawn zombie every 15 seconds
    private playerHasArmor: boolean = false;
    private lastAttackTime: number = 0;
    private attackCooldown: number = 500; // 500ms cooldown between attacks
    private lastDamageTime: number = 0;
    private damageInvincibilityTime: number = 1000; // 1 second of invincibility after taking damage
    private worldName: string = '';

    constructor() {
        super({ key: 'MainScene' });
    }

    init(data: { worldName?: string }) {
        this.worldName = data.worldName || '';
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

        // Create armor texture (24x24)
        graphics.fillStyle(0x1E90FF); // Bright steel blue for armor
        graphics.fillRect(0, 0, 24, 24);
        graphics.lineStyle(2, 0x4169E1); // Royal blue details
        graphics.strokeRect(4, 4, 16, 16); // Chest plate outline
        graphics.lineBetween(8, 8, 16, 8); // Armor detail
        graphics.generateTexture('armor', 24, 24);
        graphics.clear();

        // Create sword texture (24x24)
        graphics.fillStyle(0x4682B4); // Steel blue color for blade
        graphics.fillRect(8, 0, 8, 20); // Blade
        graphics.fillStyle(0x8B4513); // Brown for handle
        graphics.fillRect(6, 16, 12, 8); // Handle
        graphics.generateTexture('sword', 24, 24);
        graphics.clear();

        // Create zombie texture (32x32)
        graphics.fillStyle(0x2D5A27); // Dark green for zombie body
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillStyle(0xFF0000); // Red eyes
        graphics.fillRect(8, 8, 6, 6);
        graphics.fillRect(18, 8, 6, 6);
        graphics.fillStyle(0x8B0000); // Dark red for mouth
        graphics.fillRect(8, 20, 16, 4);
        graphics.generateTexture('zombie', 32, 32);
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

                // Add armor counter text (below steel)
                const armorText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 75, '', {
                    fontSize: '24px',
                    color: '#1E90FF',
                    backgroundColor: '#FFFFFF'
                });
                armorText.setOrigin(0.5);
                this.armorTexts.push(armorText);

                // Add sword counter text (below armor)
                const swordText = this.add.text(startX + (i * boxSize), boxY + boxSize/2 + 90, '', {
                    fontSize: '24px',
                    color: '#4682B4',
                    backgroundColor: '#FFFFFF'
                });
                swordText.setOrigin(0.5);
                this.swordTexts.push(swordText);
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
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Create zombies group
        this.zombies = this.physics.add.group();
        
        // Create HP text display with larger font
        this.hpText = this.add.text(16, 16, `HP: ${this.playerHP}/${this.maxPlayerHP}`, {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        });
        this.hpText.setDepth(100); // Make sure it's always visible on top

        // Create HP bar
        this.hpBar = this.add.graphics();
        this.updateHPBar();

        // Add collision between zombies and platforms
        this.physics.add.collider(this.zombies, this.platforms);
        
        // Add collision between player and zombies
        this.physics.add.collider(this.player, this.zombies, this.handleZombieCollision, undefined, this);
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
        trunk.setAlpha(0); // Make collision box invisible
        trunk.refreshBody();

        const topLower = this.physics.add.staticImage(x, y + 8, 'ground');
        topLower.setDisplaySize(48 * scale, 16 * scale);
        topLower.setAlpha(0); // Make collision box invisible
        topLower.refreshBody();

        const topUpper = this.physics.add.staticImage(x, y - 16, 'ground');
        topUpper.setDisplaySize(32 * scale, 16 * scale);
        topUpper.setAlpha(0); // Make collision box invisible
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

                        // 50% chance to get coal
                        if (Math.random() < 0.5 && this.coalInBoxes[nextBox] < 64) {
                            this.coalInBoxes[nextBox] += 1;
                            if (this.coalInBoxes[nextBox] > 64) this.coalInBoxes[nextBox] = 64;
                            this.coalTexts[nextBox].setText(this.coalInBoxes[nextBox] > 0 ? this.coalInBoxes[nextBox].toString() : '');
                        }

                        // 40% chance to get iron
                        if (Math.random() < 0.4 && this.ironInBoxes[nextBox] < 64) {
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

    private craftArmor() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with enough steel for armor
        for (let i = 0; i < this.steelInBoxes.length; i++) {
            if (this.steelInBoxes[i] >= 2 && this.armorInBoxes[i] < 64) {
                // Convert 2 steel to 1 armor in the same box
                this.steelInBoxes[i] -= 2;
                this.armorInBoxes[i] += 1;

                // Update steel counter
                if (this.steelTexts[i]) {
                    this.steelTexts[i].setText(this.steelInBoxes[i] > 0 ? this.steelInBoxes[i].toString() : '');
                }

                // Update armor counter
                if (this.armorTexts[i]) {
                    this.armorTexts[i].setText(this.armorInBoxes[i] > 0 ? this.armorInBoxes[i].toString() : '');
                }

                // Update box color
                this.updateBoxColor(i);

                // Add armor effect when crafted
                if (!this.playerHasArmor) {
                    this.playerHasArmor = true;
                    this.maxPlayerHP = 150; // Increase max HP with armor
                    this.playerHP = Math.min(this.playerHP + 50, this.maxPlayerHP); // Heal when putting on armor
                    if (this.hpText) {
                        this.hpText.setText(`HP: ${this.playerHP}/${this.maxPlayerHP}`);
                    }
                    this.updateHPBar();
                    if (this.player) {
                        this.player.setTint(0x1E90FF); // Blue tint when wearing armor
                    }
                }
                break;
            }
        }
    }

    private craftSword() {
        const currentTime = this.time.now;
        if (currentTime - this.lastPressTime < 500) return; // Prevent rapid crafting
        this.lastPressTime = currentTime;

        // Find first box with enough steel for a sword
        for (let i = 0; i < this.steelInBoxes.length; i++) {
            if (this.steelInBoxes[i] >= 1 && this.swordInBoxes[i] < 64) {
                // Convert 1 steel to 1 sword in the same box
                this.steelInBoxes[i] -= 1;
                this.swordInBoxes[i] += 1;

                // Update steel counter
                if (this.steelTexts[i]) {
                    this.steelTexts[i].setText(this.steelInBoxes[i] > 0 ? this.steelInBoxes[i].toString() : '');
                }

                // Update sword counter
                if (this.swordTexts[i]) {
                    this.swordTexts[i].setText(this.swordInBoxes[i] > 0 ? this.swordInBoxes[i].toString() : '');
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
            const armorFull = this.armorInBoxes[index] >= 64;
            const swordFull = this.swordInBoxes[index] >= 64;
            const hasWood = this.woodInBoxes[index] > 0;
            const hasPlanks = this.planksInBoxes[index] > 0;
            const hasPickaxes = this.pickaxesInBoxes[index] > 0;
            const hasStone = this.stoneInBoxes[index] > 0;
            const hasCoal = this.coalInBoxes[index] > 0;
            const hasFurnaces = this.furnacesInBoxes[index] > 0;
            const hasIron = this.ironInBoxes[index] > 0;
            const hasSteel = this.steelInBoxes[index] > 0;
            const hasArmor = this.armorInBoxes[index] > 0;
            const hasSword = this.swordInBoxes[index] > 0;
            
            if (woodFull && planksFull && pickaxesFull && stoneFull && coalFull && furnacesFull && ironFull && steelFull && armorFull && swordFull) {
                this.boxSprites[index].setTint(0x4A0404); // Very dark red (full everything)
            } else if (swordFull) {
                this.boxSprites[index].setTint(0x4682B4); // Steel blue for swords
            } else if (armorFull) {
                this.boxSprites[index].setTint(0x1E90FF); // Bright steel blue for armor
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

    private updateHPBar() {
        if (!this.hpBar) return;
        
        this.hpBar.clear();
        
        // Background of health bar (dark red)
        this.hpBar.fillStyle(0x660000);
        this.hpBar.fillRect(16, 50, 200, 20);
        
        // Calculate health percentage
        const healthPercent = this.playerHP / this.maxPlayerHP;
        
        // Foreground of health bar (bright red/green based on health)
        const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
        this.hpBar.fillStyle(color);
        this.hpBar.fillRect(16, 50, 200 * healthPercent, 20);
        
        // Border of health bar
        this.hpBar.lineStyle(2, 0xffffff);
        this.hpBar.strokeRect(16, 50, 200, 20);
        
        this.hpBar.setDepth(100); // Make sure it's always visible on top
    }

    private handleZombieCollision(player: Phaser.GameObjects.GameObject, zombie: Phaser.GameObjects.GameObject) {
        const currentTime = this.time.now;
        if (currentTime - this.lastDamageTime < this.damageInvincibilityTime) {
            return; // Still invincible, don't take damage
        }
        
        this.lastDamageTime = currentTime;
        
        if (!this.playerHasArmor) {
            this.playerHP -= 10; // Take 10 damage without armor
        } else {
            this.playerHP -= 5; // Take 5 damage with armor
        }
        
        if (this.playerHP <= 0) {
            this.playerHP = 0;
            // Restart the scene when player dies
            this.scene.restart();
        }
        
        if (this.hpText) {
            this.hpText.setText(`HP: ${this.playerHP}/${this.maxPlayerHP}`);
        }
        this.updateHPBar();

        // Flash the player red when taking damage
        if (this.player && 'setTint' in this.player) {
            this.player.setTint(0xFF0000);
            this.time.delayedCall(200, () => {
                if (this.player && 'clearTint' in this.player) {
                    if (this.playerHasArmor) {
                        this.player.setTint(0x1E90FF); // Return to blue if has armor
                    } else {
                        this.player.clearTint(); // Return to normal if no armor
                    }
                }
            });
        }
    }

    private spawnZombie() {
        // Spawn zombie at random edge of the screen
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const x = side === 'left' ? 50 : 750;
        const y = 450; // Spawn on ground level
        
        const zombie = this.zombies.create(x, y, 'zombie') as Phaser.Physics.Arcade.Sprite;
        zombie.setTint(0x00FF00); // Make zombie green
        zombie.setBounce(0.1);
        zombie.setCollideWorldBounds(true);
        
        // Set zombie movement towards player
        const zombieSpeed = 50;
        zombie.setVelocityX(side === 'left' ? zombieSpeed : -zombieSpeed);
    }

    private attackZombies() {
        if (!this.player) return;
        
        const currentTime = this.time.now;
        if (currentTime - this.lastAttackTime < this.attackCooldown) return; // Check attack cooldown
        this.lastAttackTime = currentTime;

        const attackRange = 50; // Attack range in pixels
        const playerX = this.player.x;
        const playerY = this.player.y;

        // Create a temporary visual effect for the attack
        const attackEffect = this.add.rectangle(
            playerX + (this.player.flipX ? -25 : 25), 
            playerY, 
            50, 
            50, 
            0xFF0000, 
            0.5
        );

        // Fade out and destroy the attack effect
        this.tweens.add({
            targets: attackEffect,
            alpha: 0,
            duration: 200,
            onComplete: () => attackEffect.destroy()
        });

        // Keep track of zombies to destroy
        const zombiesToDestroy: Phaser.Physics.Arcade.Sprite[] = [];

        // Check each zombie for collision with attack
        this.zombies.children.iterate((zombie: any) => {
            const zombieSprite = zombie as Phaser.Physics.Arcade.Sprite;
            const distance = Phaser.Math.Distance.Between(
                playerX, 
                playerY,
                zombieSprite.x, 
                zombieSprite.y
            );

            // Check if zombie is in attack range and in front of player
            const isInFront = this.player?.flipX ? 
                zombieSprite.x <= playerX : 
                zombieSprite.x >= playerX;

            if (distance <= attackRange && isInFront) {
                zombiesToDestroy.push(zombieSprite);
            }
            return false; // Keep iterating
        });

        // Create death effects and destroy zombies
        zombiesToDestroy.forEach(zombie => {
            // Create a death effect
            const deathEffect = this.add.rectangle(
                zombie.x,
                zombie.y,
                32,
                32,
                0x00FF00,
                0.7
            );

            // Fade out and destroy both the zombie and the effect
            this.tweens.add({
                targets: [zombie, deathEffect],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    zombie.destroy();
                    deathEffect.destroy();
                }
            });
        });
    }

    update() {
        if (!this.cursors || !this.player || !this.spaceKey || !this.escKey ||
            !this.mountain1 || !this.mountain2 || !this.duck || !this.splashSprite || 
            !this.cKey || !this.pKey || !this.iKey || !this.mKey || !this.lKey || 
            !this.fKey || !this.bKey || !this.sKey || !this.hpText || !this.aKey || !this.xKey) return;

        // Handle ESC key to return to menu
        if (this.escKey.isDown) {
            this.scene.start('MenuScene', { 
                showNamePrompt: true,
                worldName: this.worldName
            });
            return;
        }

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

        // Handle attacking
        if (this.aKey.isDown) {
            this.attackZombies();
        }

        // Handle horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
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

        // Handle armor crafting
        if (this.sKey.isDown) {
            this.craftArmor();
        }

        // Handle sword crafting
        if (this.xKey.isDown) {
            this.craftSword();
        }

        // Check if it's time to create a new tree (every 10 seconds)
        const currentTime = this.time.now;
        if (currentTime - this.lastTreeTime >= 10000) { // 10000ms = 10 seconds
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

        // Spawn zombies periodically
        if (currentTime - this.lastZombieSpawnTime >= this.zombieSpawnInterval) {
            this.spawnZombie();
            this.lastZombieSpawnTime = currentTime;
        }

        // Update zombie movement
        this.zombies.children.iterate((zombie: any) => {
            if (!this.player) return;
            
            // Make zombies move towards player
            const zombieSprite = zombie as Phaser.Physics.Arcade.Sprite;
            if (zombieSprite.x < this.player.x) {
                zombieSprite.setVelocityX(50);
            } else {
                zombieSprite.setVelocityX(-50);
            }
        });
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
