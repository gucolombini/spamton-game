// todos os elementos foram separados em classes, para facilitar que sejam instanciados muitas vezes simultaneamente

//classe dos kromer, que devem ser coletados
class Kromer extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super (scene, x, y, 'kromer')

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
        this.body.collideWorldBounds = true;
        this.state = 'idle'
        this.prevstate = 'idle'
        this.anims.play('idle')

    // valores customizáveis:
        this.accel = 0
        this.friction = 0.2
        this.speed = 20
        this.max = 400

    // chance do easter egg de dança
        this.dance = Phaser.Math.Between(1, 20)
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
    // animação do easter egg de dança
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
            console.log('jump')
            this.anims.play('jump')
            return;
        }
        if (this.state == 'idle' && this.prevstate != 'idle')
        {
            console.log('idle')
            this.anims.play('idle')
            return;
        }
        if (this.state == 'walk' && this.prevstate != 'walk')
        {
            console.log('walk')
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

    constructor() {
        super({
            key: 'Main',
        })
    };

    preload(){
        this.load.spritesheet('spamton', '../assets/spamton.png', { frameWidth: 40, frameHeight: 40 });
        this.load.image('platform', '../assets/platform.png');
        this.load.image('pipis', '../assets/pipis.png');
        this.load.image('kromer', '../assets/kromer.png');
        this.load.spritesheet('explosion', '../assets/explosion.png', { frameWidth: 71, frameHeight: 100 })
        this.load.audio('gameMusic', '../assets/spamton_battle.ogg')
        this.load.audio('laugh', '../assets/spamton_laugh_noise.ogg')
        this.load.audio('explodeSound', '../assets/explosion.ogg')
    }

    create()
    {   
        this.gameMusic = this.sound.add('gameMusic')
        this.gameMusic.loop = true;
        this.gameMusic.play();
        this.explodeSound = this.sound.add('explodeSound');
        this.explodeSound.loop = false;
        this.laugh = this.sound.add('laugh')
        this.laugh.loop = false;
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 17 }),
            frameRate: 10,
            repeat: 0,
            hideOnComplete: true
        });

        this.gameActive = 1
        this.deathTimer = 0

        // timers de spawn de pipis e kromers
        this.pipisTimer = 0
        this.kromerTimer = 249

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
    };

    update(){

        // se gameActive !== 1, o jogo acabou, e o código base não é executado
        if (this.gameActive == 1)
        { if (this.players.length == 0)
            {
                this.gameActive = 0
                console.log('troleado')
                this.gameMusic.stop();
                return;
            }
            
            // todos os players podem ser controlados simultâneamente pelos mesmos inputs
            this.players.forEach(player =>
                {
                player.moveLogic();
                player.animLogic();
                });

            // a cada update os timers aumentam em 1 incremento
            this.pipisTimer++
            this.kromerTimer++
            
            // quando timer chegar ao número desejado, instanciar elemento pipis
            if (this.pipisTimer >= 100){
                this.pipisTimer = 0
                let pipis = new Pipis(this, Phaser.Math.Between(50, 590), 0);
                pipis.setVelocityX(Phaser.Math.Between(-400, 400));
                this.pipisAll.push(pipis)
                if(this.pipisAll.length == 4){
                    this.pipisAll[0].destroy();
                    this.pipisAll.shift();
                }
                console.log('pipis')
            };

            // ditto mas para kromer
            if (this.kromerTimer >= 250){
                this.kromerTimer = 0
                let kromer = new Kromer(this, Phaser.Math.Between(50, 590), Phaser.Math.Between(100, 400));
                this.kromerAll.push(kromer)
                if(this.kromerAll.length == 5){
                    this.kromerAll[0].destroy();
                    this.kromerAll.shift();
                }
                console.log('kromer')
            };
        }
        // se o jogo acabar, esperar o timer de morte antes de trocar de cena
        else {
            this.deathTimer++
            if(this.deathTimer >= 100) {
                this.scene.start('Over');
            }
        };
    };

    // quando coletar pipis, destruir player
    collectPipis(player, pipis) {
        const explosion = this.add.sprite(player.x, player.y, 'explosion');
        explosion.play('explode');
        const playerIndex = this.players.indexOf(player);
        if (playerIndex !== -1) {
            this.players.splice(playerIndex, 1);
        }
        player.destroy();
        pipis.destroy();
        this.explodeSound.play();
    }

    // quando coletar kromer, criar novo player
    collectKromer(player, kromer) {
        kromer.destroy();
        let newPlayer = new Player (this, player.x+10, player.y);
        newPlayer.max = newPlayer.max + Phaser.Math.Between(-100, 100)
        newPlayer.dance = Phaser.Math.Between(1, 10)
        this.players.push(newPlayer);
        this.laugh.play();
    }
}