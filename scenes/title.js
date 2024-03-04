class Title extends Phaser.Scene {
    constructor() {
        super({
            key: 'Title',
        })
    };

    preload()
    {
        this.load.image('titlescreen', '../assets/titlescreen.png')
        this.load.audio('titleMusic', '../assets/spamton_meeting.ogg')
    }
    create()
    {
        // carregar imagem de titulo e musica
        this.titleMusic = this.sound.add('titleMusic')
        this.titleMusic.play();
        this.add.image(320, 240, 'titlescreen')
        // quando clicada, iniciar jogo principal
        this.input.on('pointerdown', () => {
            this.scene.start('Main');
            this.titleMusic.stop();
        });
    }
};