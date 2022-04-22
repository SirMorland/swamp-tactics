import * as PIXI from 'pixi.js';
import { Ninja } from './GameCharacter';
import { TurnController } from './TurnController';
import { hsl, position2dTo3d } from './Utils';

export class PlayArea {
	grid: Space[][] = [];
	turnController: TurnController;
	onCancel: (() => void)[] = [];

	constructor(stage: PIXI.Container, turnController: TurnController) {
		this.turnController = turnController;

		for(let x = 0; x < 5; x++) {
			this.grid.push([]);
			for(let y = 0; y < (x % 2 === 0 ? 5 : 4); y++) {
				this.grid[x].push(
					new Space(stage, x, y, hsl(144, 100, 70))
				);
			}
		}
	}

	space(position: {x: number, y: number}) {
		return this.grid[position.x][position.y];
	}

	findClosestTo(position: {x: number, y: number}): {x: number, y: number} {
		let closest: {x: number, y: number} = null;
		let distance = null;

		const pos = position2dTo3d(position);

		this.grid.forEach((column, x) => {
			column.forEach((space, y) => {
				if(space.color !== space.initialColor) {
					const point = {x, y};
					let d = pos.distanceTo(position2dTo3d(point));
					if(distance === null || d < distance) {
						closest = point;
						distance = d;
					}
				}
			});
		});

		return closest;
	}

	clear() {
		this.grid.forEach(column => {
			column.forEach(space => {
				space.color = space.initialColor;
				space.g.alpha = 0.1;
				space.g.removeAllListeners();
				space.g.on('pointerdown', () => {
					this.onCancel.forEach(a => a());
				})
			})
		});

		this.grid[this.turnController.turn.position.x][this.turnController.turn.position.y].g.alpha = 0.9;
	}
}

class Space {
	g: PIXI.Graphics;
	occupied: Ninja = null;
	initialColor: number;
	_color: number;

	get color() {
		return this._color;
	}
	set color(color: number) {
		this._color = color;
		this.g.clear();
		this.draw();
	}

	constructor(stage: PIXI.Container, x: number, y: number, color: number) {
		this.initialColor = color;
		this._color = color;

		this.g = new PIXI.Graphics();
		this.g.position.x = (x - 2) * 3;
		this.g.position.y = (y - 2) * 2 + (x % 2 === 0 ? 0 : 1 );
		this.g.scale.x = 0.95;
		this.g.scale.y = 0.9;
		this.g.alpha = 0.1;
		this.g.interactive = true;
		this.draw();
		stage.addChild(this.g);
	}

	draw() {
		this.g.beginFill(this.color);
		this.g.drawPolygon([-2, 0, -1, 1, 1, 1, 2, 0, 1, -1, -1, -1]);
		this.g.endFill();
	}
}