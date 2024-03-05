// todos os elementos foram separados em classes, para facilitar que sejam instanciados muitas vezes simultaneamente

//classe dos kromer, que devem ser coletados
class Kromer extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super (scene, x, y, 'kromer')

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.setAllowGravity(false);
        this.body.setSize(34, 34)
    }
}

//classe da banana, que também deve ser coletada
class Potassium extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super (scene, x, y, 'potassium')

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('potassium', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.play('spin')
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.setAllowGravity(false);
    }
}

// classe dos pipis, obstaculos do jogador
class Pipis extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super (scene, x, y, 'pipis')
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.collideWorldBounds = true;
        this.setBounce(1)
    }
}

// classe do jogador
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super (scene, x, y, 'spamton')

            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('spamton', { start: 0, end: 0 }),
                frameRate: 0,
                repeat: 0});

            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('spamton', { start: 1, end: 2 }),
                frameRate: 10,
                repeat: -1});

            this.anims.create({
                key: 'jump',
                frames: this.anims.generateFrameNumbers('spamton', { start: 2, end: 2 }),
                frameRate: 10,
                repeat: -1});

            this.anims.create({
                key: 'dance',
                frames: this.anims.generateFrameNumbers('spamton', { start: 3, end: 58 }),
                frameRate: 10,
                repeat: -1});

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setScale(1)
        this.setSize(25, 40)
        this.body.collideWorldBounds = true;
        this.state = 'idle'
        this.prevstate = 'idle'
        this.anims.play('idle')

    // valores customizáveis:
        this.accel = 0
        this.friction = 0.2
        this.speed = 20
        this.max = 400

    // a mão pra cima, cintura solta, da meia volta, dança kudurooooo
    // dance: checa se o spamton está em estado de dança
    // dancing: usado apenas para checar se a animação está tocando
        this.dance = 0
        this.dancing = 0

    };

    moveLogic()
    {
    // prevstate é definido para permitir que as animações só iniciem quando o estado do jogador mudar
        this.prevstate = this.state
        this.state = 'idle'

    // código de movimento e aceleração do jogador
        if(this.accel === 0.5 || this.accel === -0.4) {
            this.accel = 0
        }
        if(this.scene.arrowkeys.right.isDown)
        {
            if(this.body.velocity.x < -200)
            {
                this.desaccel()
            }
            else {
                this.state = 'walk'
                this.accel += this.speed;
            }
        };
        if(this.scene.arrowkeys.left.isDown)
        {
            if(this.body.velocity.x > 200)
            {
                this.desaccel()
            } 
            else {
                this.state = 'walk'
                this.accel -= this.speed;
            }
        };

        if(!this.scene.arrowkeys.right.isDown && !this.scene.arrowkeys.left.isDown || this.scene.arrowkeys.right.isDown && this.scene.arrowkeys.left.isDown)
        {
        this.desaccel();
        this.state = 'idle';
        };

    // jogador só pode pular se estiver no chão
        if(this.scene.arrowkeys.up.isDown && this.body.onFloor() && this.prevstate !== 'jump')
        {
            this.state = 'jump';
            this.setVelocityY(-800);
        };

    // a aceleração é limitada para o valor de this.max
        if ( this.accel > this.max ){
            this.accel = this.max;
        }
        if ( this.accel < -this.max ){
            this.accel = -this.max;
        }
        this.setVelocityX(this.accel);

    // se ele não estiver no chão, o estado dele é automaticamente estabelecido como pulando
        if(!this.body.onFloor())
        {
            this.state = 'jump';
        };
    };

    animLogic()
    {
    // animação da dança
        if (this.dance == 1)
        {
            if (this.dancing == 0)
            {
                this.dancing = 1
                this.anims.play('dance')
                return;
            } else {
                return;
            }
        }

    // virar de acordo com a direção de movimento
        if (this.accel > 0 )
        {
            this.setFlip(true);
        } else if (this.accel < 0)
        {
            this.setFlip(false);
        }

    // código das animações
        if (this.state == 'jump' && this.prevstate != 'jump')
        {
            this.anims.play('jump')
            return;
        }
        if (this.state == 'idle' && this.prevstate != 'idle')
        {
            this.anims.play('idle')
            return;
        }
        if (this.state == 'walk' && this.prevstate != 'walk')
        {
            this.anims.play('walk')
        }
    };

    // função de desaceleração quando ele não estiver se movendo
    desaccel()
    {
        this.accel = (Math.round(10*this.accel - 10*this.accel*this.friction))/10;
    }
}


class Main extends Phaser.Scene {

// decidi separar todos os elementos do jogo em suas arrays respectivas, o que facilitou a programação de clonagem
// dos elementos, permitindo que eu tenha controle sobre o que acontece com cada um dos clones.
    players = []
    platforms = []
    pipisAll = []
    kromerAll = []
    potassiumAll = []
    time = 0
    score = 0

    constructor() {
        super({
            key: 'Main',
        })
    };

    preload(){
        this.load.image('bglayer1', '../assets/bglayer1.png');
        this.load.image('bglayer2', '../assets/bglayer2.png');
        this.load.image('platform', '../assets/platform.png');
        this.load.image('pipis', '../assets/pipis.png');
        this.load.image('kromer', '../assets/kromer.png');
        this.load.spritesheet('spamton', '../assets/spamton.png', { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet('potassium', '../assets/potassium.png', { frameWidth: 17, frameHeight: 19 });
        this.load.spritesheet('explosion', '../assets/explosion.png', { frameWidth: 71, frameHeight: 100 });
        this.load.spritesheet('pipisBreak', '../assets/pipisbreak.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('diffAlerts', '../assets/difficultyalerts.png', { frameWidth: 256, frameHeight: 48 });
        this.load.audio('gameMusic', '../assets/spamton_battle.ogg');
        this.load.audio('bigShot', '../assets/spamton_neo_mix_ex_wip.ogg');
        this.load.audio('laugh', '../assets/spamton_laugh_noise.ogg');
        this.load.audio('shine', '../assets/snd_great_shine.ogg');
        this.load.audio('rurus', '../assets/snd_rurus_appear.ogg');
        this.load.audio('wow', '../assets/wow.ogg');
        this.load.audio('explodeSound', '../assets/explosion.ogg');
        this.load.bitmapFont('DeterminationMono', '../assets/DeterminationMono.png', '../assets/DeterminationMono.xml');
    }

    create()
    {   
        // limite de fps caso monitor seja de maior frequência
        this.physics.world.setFPS(60);

        // adicionando assets de texto e audio no jogo
        this.scoreBoard = this.add.bitmapText(20, 20, 'DeterminationMono', 'Hello World');
        this.scoreBoard.setFontSize(20);
        this.spamBoard = this.add.bitmapText(20, 50, 'DeterminationMono', 'Hello World');
        this.spamBoard.setFontSize(20);
        this.bglayer2 = this.add.image(200, 110, 'bglayer2')
        this.bglayer1 = this.add.image(300, 300, 'bglayer1')
        this.gameMusic = this.sound.add('gameMusic')
        this.gameMusic.loop = true;
        this.gameMusic.play();
        this.bigShot = this.sound.add('bigShot')
        this.bigShot.loop = true;
        this.explodeSound = this.sound.add('explodeSound');
        this.explodeSound.loop = false;
        this.laugh = this.sound.add('laugh')
        this.laugh.loop = false;
        this.shine = this.sound.add('shine')
        this.shine.loop = false;
        this.rurus = this.sound.add('rurus')
        this.rurus.loop = false;
        this.wow = this.sound.add('wow')
        this.wow.loop = false;

        // efeitos especiais
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 17 }),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'pipisDie',
            frames: this.anims.generateFrameNumbers('pipisBreak', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'diffUp',
            frames: this.anims.generateFrameNumbers('diffAlerts', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: 8,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'diffBIGSHOT',
            frames: this.anims.generateFrameNumbers('diffAlerts', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: 8,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'diffCungadero',
            frames: this.anims.generateFrameNumbers('diffAlerts', { start: 4, end: 5 }),
            frameRate: 10,
            repeat: 8,
            hideOnComplete: true
        });

        // restaurando valores
        this.frameCount = 0
        this.time = 0
        this.score = 0
        this.casualties = 0
        this.pipisAll = []
        this.kromerAll = []
        this.potassiumAll = []
        this.gameActive = 1
        this.deathTimer = 0
        this.difficulty = 0

        // timers de spawn de pipis e kromers
        this.pipisTimer = 0
        this.kromerTimer = 249
        this.potassiumTimer = Phaser.Math.Between(0, 300)

        // instanciando plataformas
        for(let i = 0; i<5; i++)
        {
        let plataforma = this.physics.add.staticImage(100+32*i, 300, 'platform').setScale(1);
        this.platforms.push(plataforma);
        };

        for(let i = 0; i<5; i++)
        {
        let plataforma = this.physics.add.staticImage(400+32*i, 200, 'platform').setScale(1);
        this.platforms.push(plataforma);
        };

        // criando controles do jogador
        this.arrowkeys = this.input.keyboard.createCursorKeys()

        // instanciado o primeiro jogador
        let player = new Player(this, 100, 100)
        this.players.push(player);

        // colisões entre os elementos
        this.physics.add.collider(this.players, this.platforms)
        this.physics.add.collider(this.pipisAll, this.platforms)
        this.physics.add.collider(this.players, this.pipisAll, this.collectPipis, null, this);
        this.physics.add.collider(this.players, this.kromerAll, this.collectKromer, null, this);
        this.physics.add.collider(this.players, this.potassiumAll, this.collectPotassium, null, this);
    };

    update(){
        // tabela de pontos
        this.scoreBoard.setText('[Score]: ' + this.score);
        this.spamBoard.setText('[[SPAMTON]]: ' + this.players.length);

        // animação do fundo
        if (this.bglayer1.x != 250)
        {
            this.bglayer1.x -= 0.5
            this.bglayer1.y -= 0.5
        }
        else {
            this.bglayer1.x = 300
            this.bglayer1.y = 300
        }
        if (this.bglayer2.x != 300)
        {
            this.bglayer2.x += 0.125
            this.bglayer2.y += 0.125
        }
        else {
            this.bglayer2.x = 200
            this.bglayer2.y = 110
        }
        // se gameActive !== 1, o jogo acabou, e o código base não é executado
        if (this.gameActive == 1)
        { if (this.players.length == 0)
            {
                this.gameActive = 0
                console.log('troleado')
                this.gameMusic.stop();
                this.bigShot.stop();
                return;
            }
            
            // todos os players podem ser controlados simultâneamente pelos mesmos inputs
            this.players.forEach(player =>
                {
                player.moveLogic();
                player.animLogic();
                });

            // a cada update os timers aumentam em 1 incremento
            this.frameCount++
            this.pipisTimer++
            this.kromerTimer++
            this.potassiumTimer++

            // a cada 60 frames, 1 segundo passa
            if (this.frameCount == 60)
            {
                this.frameCount = 0
                this.time++
                this.score += 100
                this.players.forEach(player =>
                    {
                        if (player.dance == 1) 
                        {
                            this.score += 50
                        } else {
                            this.score += 10
                        }
                    });
            }
            
            // quando timer chegar ao número desejado, instanciar elemento pipis
            if (this.pipisTimer >= 100){
                this.difficultyCheck()
                this.pipisTimer = 0
                let pipis = new Pipis(this, Phaser.Math.Between(50, 590), 0);
                pipis.setVelocityX(Phaser.Math.Between(-400, 400));
                this.pipisAll.push(pipis)
            // quanto maior a pontuação, mais pipis poderão estar na tela ao mesmo tempo
                if(this.pipisAll.length == 2 + Math.round(this.score * 0.00005)){
                    const pipisDie = this.add.sprite(this.pipisAll[0].x, this.pipisAll[0].y, 'pipisBreak');
                    pipisDie.play('pipisDie');
                    this.pipisAll[0].destroy();
                    this.pipisAll.shift();
                }
            };

            // ditto mas para kromer
            if (this.kromerTimer >= 250){
                this.kromerTimer = 0
                let kromer = new Kromer(this, Phaser.Math.Between(50, 590), Phaser.Math.Between(100, 400));
                this.kromerAll.push(kromer)
                if(this.kromerAll.length == 5){
                    this.kromerAll[0].destroy();
                    this.kromerAll.shift();
                };
            };
            
            // ditto denovo mas para banana
            if (this.potassiumTimer >= 300){
                this.potassiumTimer = Phaser.Math.Between(0, 300);
                if (Phaser.Math.Between(1, 8) == 1)
                {
                    let potassium = new Potassium(this, Phaser.Math.Between(50, 590), Phaser.Math.Between(100, 400));
                    this.potassiumAll.push(potassium)
                    if(this.potassiumAll.length == 2){
                        this.potassiumAll[0].destroy();
                        this.potassiumAll.shift();
                    };
                };
            };
        }
        // se o jogo acabar, esperar o timer de morte antes de trocar de cena
        else {
            this.deathTimer++
            if(this.deathTimer >= 100) {
                this.scene.start('Over', { score: this.score, time: this.time, casualties: this.casualties });
            }
        };
    };

    // quando coletar pipis, destruir player + tocar explosão
    collectPipis(player, pipis) {
        const explosion = this.add.sprite(player.x, player.y, 'explosion');
        explosion.play('explode');
        const playerIndex = this.players.indexOf(player);
        this.players.splice(playerIndex, 1);
        const pipisIndex = this.pipisAll.indexOf(pipis);
        this.pipisAll.splice(pipisIndex, 1);
        player.destroy();
        pipis.destroy();
        this.casualties ++
        this.explodeSound.play();
    }

    // quando coletar kromer, criar novo player
    collectKromer(player, kromer) {
        kromer.destroy();
        let newPlayer = new Player (this, player.x+10, player.y);
        newPlayer.max = newPlayer.max + Phaser.Math.Between(-100, 100)
        this.players.push(newPlayer);
        this.laugh.play();
        this.score += 500
    }

    // quando coletar banana, player dança
    collectPotassium(player, potassium) {
        potassium.destroy();
        player.dance = 1
        this.shine.play();
        this.wow.play();
        this.score += 500
    }

    // lógica que checa a dificuldade e altera a música e os alertas de acordo
    difficultyCheck(){
        if (this.difficulty != Math.round(this.score * 0.00005))
        {
            this.rurus.play()
            if (this.difficulty == 3 && Math.round(this.score * 0.00005) == 4)
            {
                this.difficulty = Math.round(this.score * 0.00005)
                this.gameMusic.stop()
                setTimeout(() => {
                    this.bigShot.play();
                }, 2000);
            }
            this.difficulty = Math.round(this.score * 0.00005)
            console.log('difficulty up!')
            console.log(this.difficulty)
            this.difficultyAlert()
            this.gameMusic.setRate(1 + this.difficulty*0.025)
        }
    }

    // alerta quando dificuldade aumenta
    difficultyAlert()
    {
        if (this.difficulty < 4)
        {
            const alert = this.add.sprite(320, 360, 'diffAlerts').setScale(1)
            alert.anims.play('diffUp')
        } else if (this.difficulty == 4)
        {
            const alert = this.add.sprite(320, 240, 'diffAlerts').setScale(2)
            alert.anims.play('diffBIGSHOT')
        } else
        {
            const alert = this.add.sprite(320, 360, 'diffAlerts').setScale(1.5)
            alert.anims.play('diffCungadero')
        }
    }
}