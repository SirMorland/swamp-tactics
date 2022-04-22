import { EnemyCharacter, Ninja } from "./GameCharacter";

export class TurnController {
	turn: Ninja;

	constructor() {
	}

	start(first: Ninja, second: Ninja) {
		this.turn = Math.random() < 0.5 ? first : second;

		if(this.turn instanceof EnemyCharacter) {
			const enemy = this.turn;
			enemy.playArea.clear();
			setTimeout(() => {
				enemy.takeTurn();
			}, 2000);
		} else {
			this.turn.playArea.clear();
		}
	}
}