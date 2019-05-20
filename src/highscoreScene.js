import ControlsToWrite from "./controlsToWrite.js";

export const mode = {
    invisible: 'invisible',
    enteringName: 'entering name',
    listingNames: 'listing names'
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ ';

export default class HighscoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Highscore', active: true });
    }

    handleEndOfGame(score) {
        if (this.mode === mode.invisible) {
            this.score = score;
            this.mode = mode.enteringName;
        }
    }

    handleReset() {
        this.mode = mode.invisible;
    }

    create() {
        const textConfig = {
            fontSize: '32px',
            align: 'center',
            fill: '#FFFFFF',
            backgroundColor: 'transparent'
        };
        this.mode = mode.invisible
        this.score = 100;
        this.playerName = '';
        this.playerCharIndex = 0;
        this.playerText = this.add.text(250, 40, '_', textConfig);
        this.scoreText = this.add.text(250, 100, 'Your Score:', textConfig);
        this.table = [
            this.createTableRow(0, textConfig),
            this.createTableRow(1, textConfig),
            this.createTableRow(2, textConfig),
            this.createTableRow(3, textConfig),
            this.createTableRow(4, textConfig),
            this.createTableRow(5, textConfig)
        ];
        this.reloadHighScore();
        this.controlsToWrite = new ControlsToWrite(this);
    }

    createTableRow(rowIndex, textConfig) {
        const dx = 140;
        const dy = 60;
        const x = 100;
        const y = 160 + (rowIndex * dy);
        return [
            this.add.text(x, y, '', textConfig),
            this.add.text(x + dx, y, '', textConfig),
            this.add.text(x + 2 * dx, y, '', textConfig)
        ];
    }

    reloadHighScore() {
        const scores = this.loadHighScores();
        this.reloadTableRow(0, 'RANK', 'SCORE', 'NAME')
        for (let i = 0; i < scores.length && i < this.table.length - 1; i++) {
            const { name, score } = scores[i];
            const ordinals = ['1ST', '2ND', '3RD', '4TH', '5TH']
            this.reloadTableRow(i + 1, ordinals[i], score, name);
        }
    }

    reloadTableRow(index, c1, c2, c3) {
        const row = this.table[index];
        row[0].setText(c1);
        row[1].setText(c2);
        row[2].setText(c3);
    }

    /**
     * return array of {
     *  name: 'Alice',
     *  score: 120
     * }
     */
    loadHighScores() {
        const scoresJson = localStorage.getItem('high-score');
        const scores = scoresJson ? JSON.parse(scoresJson) : [];
        return scores.sort((a, b) => b.score - a.score);
    }

    addHighScore({ name, score }) {
        const highScore = this.loadHighScores('high-score');
        highScore.push({ name, score });
        localStorage.setItem('high-score', JSON.stringify(highScore));
        this.reloadHighScore();
    }

    update(time) {
        switch (this.mode) {
            case mode.invisible:
                this.cameras.main.setVisible(false);
                break;
            case mode.enteringName:
                this.cameras.main.setVisible(true);
                this.handleInputs(time);
                break;
            case mode.listingNames:
                this.cameras.main.setVisible(true);
                break;
            default:
                console.error('unknown mode', this.mode);
        }
        this.updatePlayerText(time);
    }

    handleInputs(time) {
        const { remove, nextDigit, nextChar, prevChar, done } = this.controlsToWrite.getCurrectInput(time);
        if (nextChar) {
            this.playerCharIndex = (this.playerCharIndex + 1) % alphabet.length;
        } else if (prevChar) {
            this.playerCharIndex = this.playerCharIndex > 0 ?
                this.playerCharIndex - 1 :
                alphabet.length - 1;
        } else if (remove) {
            this.playerName = this.playerName.substring(0, this.playerName.length - 1);
            this.playerCharIndex = 0;
        } else if (nextDigit) {
            this.playerName += alphabet[this.playerCharIndex];
            this.playerCharIndex = 0;
        } else if (done) {
            this.playerName += alphabet[this.playerCharIndex];
            this.addHighScore({
                name: this.playerName,
                score: this.score
            });
            this.playerName = '';
            this.playerCharIndex = 0;
            this.mode = mode.listingNames;
        }
    }

    updatePlayerText(time) {
        if (this.mode === mode.enteringName) {
            this.playerText.setText(
                this.playerName + alphabet[this.playerCharIndex] + '_'
            );
        } else {
            this.playerText.setText('');
        }
    }

    _handleScore(activeObjects) {
        const score = this._getProperty(activeObjects, 'Score');
        if (score) {
            this.level.this.scene.get('high-score');
        }
    }
}
