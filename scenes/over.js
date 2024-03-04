class Over extends Phaser.Scene {
    constructor() {
        super({
            key: 'Over',
        })
    };

    preload()
    {
        this.load.image('death', '../assets/death.png')
        this.load.audio('deathMusic', '../assets/spamton_neo_after.ogg')
    }
    create()
    {
        // musica e tela de game over
        this.deathMusic = this.sound.add('deathMusic')
        this.deathMusic.loop = true;
        this.deathMusic.play();
        this.add.image(320, 240, 'death')
        // reiniciar jogo ao clicar
        this.input.on('pointerdown', () => {
            this.deathMusic.stop();
            this.scene.start('Main');
        });
    }
};