class Over extends Phaser.Scene {
    constructor() {
        super({
            key: 'Over',
        })
    };

    init(data)
    {
        // importar dados da cena do jogo
        this.score = data.score
        this.time = data.time
        this.casualties = data.casualties
    };
    preload()
    {
        this.load.image('death', '../assets/death.png')
        this.load.audio('deathMusic', '../assets/spamton_neo_after.ogg')
    };
    create()
    {   
        // musica e tela de game over
        this.deathMusic = this.sound.add('deathMusic')
        this.deathMusic.loop = true;
        this.deathMusic.play();
        this.add.image(320, 240, 'death')
        // resultado do jogador
        this.add.bitmapText(500, 250, 'DeterminationMono', 'Score: ' + this.score);
        this.add.bitmapText(500, 270, 'DeterminationMono', 'Time: ' + this.getTime(this.time));
        this.add.bitmapText(500, 290, 'DeterminationMono', 'Casualties: ' + this.casualties);
        // reiniciar jogo ao clicar
        this.input.on('pointerdown', () => {
            this.deathMusic.stop();
            this.scene.start('Main');
        });
    }
        // conversão de segundos para hh:mm:ss
    getTime(seconds) {
        let h = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        let min = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        if (seconds.toString().length < 2) seconds = "0" + seconds;
        if (min.toString().length < 2) min = "0" + min;
        return (h + ":" + min + ":" + seconds);
      }
};