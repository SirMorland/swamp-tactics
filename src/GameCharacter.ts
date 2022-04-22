import * as THREE from 'three';
import { MathUtils, Vector3 } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PlayArea } from './PlayArea';
import { hsl, position2dTo3d } from './Utils';

export enum ACTION {
	MOVE,
	ATTACK,
	BRAG,
	DEFEND
};

export class GameCharacter {
	scene : THREE.Group;
	mixer : THREE.AnimationMixer;
	clips : Object = {};
	actions : Object = {};
	currentAction : THREE.AnimationAction;
	playArea: PlayArea;

	constructor(glbFile: string, material: THREE.Material, scene: THREE.Scene, playArea: PlayArea, onLoaded: () => void) {
		this.playArea = playArea;

		const loader = new GLTFLoader();
		loader.load(glbFile, gltf => {
			this.scene = gltf.scene;
		
			this.scene.traverse((child : THREE.Mesh) => {
				if(child.isMesh) {
					child.material = material;
				}
			});
			
			this.mixer = new THREE.AnimationMixer(gltf.scene);
			gltf.animations.forEach(clip => {
				this.clips[clip.name] = clip;

				this.actions[clip.name] = this.mixer.clipAction(clip);
			});

			onLoaded();

			scene.add(this.scene);
		});
	}
}

export class Ninja extends GameCharacter {
	maxHp: number = 5;
	hp: number = this.maxHp;

	damage: number = 1;
	bragged: boolean = false;
	defending: boolean = false;

	onActionStarted: ((action: ACTION) => void)[] = [];
	onActionUpdated: (() => void)[] = [];
	onActionEnded: (() => void)[] = [];
	position: {x: number, y: number};
	anotherPosition: {x: number, y: number};
	moveAction: boolean = false;

	get position3d() {
		return position2dTo3d(this.position);
	}

	constructor(material: THREE.Material, scene: THREE.Scene, playArea: PlayArea, onLoaded: () => void) {
		super('cibus_ninja.glb', material, scene, playArea, () => {
			this.scene.position.copy(this.position3d);

			this.playArea.grid[this.position.x][this.position.y].occupied = this;

			this.actions['Armature|attack'].setLoop(THREE.LoopOnce, 1);
			this.actions['Armature|brag'].setLoop(THREE.LoopOnce, 1);
			this.actions['Armature|defend'].setLoop(THREE.LoopOnce, 1);
			this.actions['Armature|defend'].clampWhenFinished = true;
			this.actions['Armature|hit'].setLoop(THREE.LoopOnce, 1)

			this.currentAction = this.actions['Armature|idle'].play();

			this.mixer.addEventListener('finished', e => {
				switch(e.action._clip.name) {
					case 'Armature|attack':
						this.currentAction = this.actions['Armature|idle'].reset().play();
						this.onActionEnded.forEach(a => a());
						break;
					case 'Armature|brag':
						this.currentAction = this.actions['Armature|idle'].reset().play();
						this.onActionEnded.forEach(a => a());
						break;
					case 'Armature|defend':
						this.onActionEnded.forEach(a => a());
						break;
					case 'Armature|hit':
						this.currentAction = this.actions['Armature|idle'].reset().play();
						break;
					default:
						break;
				}
			});

			onLoaded();
		});
	}

	update(delta: number) {	
		if(this.scene) {
			const pos = this.position3d;
			if(this.scene.position.distanceTo(pos) > 0.1) {
				this.scene.lookAt(pos);
				this.scene.translateZ(5 * delta);
			} else if(this.moveAction) {
				this.moveAction = false;
				this.onActionEnded.forEach(a => a());
			}
			this.mixer.update(delta);
		}
	}

	move(position: {x: number, y: number}) {
		this.moveAction = true;
		this.playArea.space(this.position).occupied = null;
		this.playArea.space(position).occupied = this;

		this.anotherPosition = this.position;
		this.position = position;
		this.scene.lookAt(this.position3d);

		this.onActionStarted.forEach(a => a(ACTION.MOVE));
		this.currentAction = this.actions['Armature|idle']
			.reset()
			.crossFadeFrom(this.currentAction, 0.1, true)
			.play();

		this.defending = false;

		this.playArea.clear();
	}
	attack(position: {x: number, y: number}) {
		this.scene.lookAt(position2dTo3d(position));
		this.anotherPosition = position;

		this.onActionStarted.forEach(a => a(ACTION.ATTACK));
		this.currentAction = this.actions['Armature|attack']
			.reset()
			.crossFadeFrom(this.currentAction, 0.1, true)
			.play();

		const enemy = this.playArea.space(position).occupied;
		if(enemy) {
			enemy.scene.lookAt(this.position3d);
			setTimeout(() => {
				enemy.hit();
			}, 500);

			setTimeout(() => {
				enemy.hp -= this.damage + (this.bragged ? 2 : 0) - (enemy.defending ? 1 : 0);
				this.bragged = false;
				this.defending = false;
				enemy.bragged = false;
				enemy.defending = false;
				this.onActionUpdated.forEach(a => a());
			}, 1500);
		}
		
		this.playArea.clear();
	}

	brag() {
		this.anotherPosition = null;

		this.onActionStarted.forEach(a => a(ACTION.BRAG));
		this.currentAction = this.actions['Armature|brag']
			.reset()
			.crossFadeFrom(this.currentAction, 0.1, true)
			.play();

		this.bragged = true;
		this.defending = false;
		this.playArea.clear();
	}

	defend() {
		this.anotherPosition = null;

		this.onActionStarted.forEach(a => a(ACTION.DEFEND));
		this.currentAction = this.actions['Armature|defend']
			.reset()
			.crossFadeFrom(this.currentAction, 0.1, true)
			.play();
			
		this.defending = true;
		this.playArea.clear();
	}

	hit() {
		this.currentAction = this.actions['Armature|hit']
			.reset()
			.crossFadeFrom(this.currentAction, 0.1, true)
			.play();
	}

	showMove() {
		this.playArea.clear();

		const {x, y} = this.position;

		const candidates = [
			{x: x - 1, y: y - ((x - 1) % 2 === 0 ? 0 : 1) },
			{x: x - 1, y: y + ((x - 1) % 2 === 0 ? 1 : 0) },
			{x: x    , y: y + 1},
			{x: x    , y: y - 1},
			{x: x + 1, y: y - ((x + 1) % 2 === 0 ? 0 : 1)},
			{x: x + 1, y: y + ((x + 1) % 2 === 0 ? 1 : 0)}
		];

		candidates.forEach(candidate => {
			if(candidate.x >= 0 && candidate.x < 5 &&
			   candidate.y >= 0 && candidate.y < (candidate.x % 2 === 0 ? 5 : 4) &&
			   !this.playArea.space(candidate).occupied) {
				const space = this.playArea.space(candidate);
				space.color = hsl(72, 100, 70);
				space.g.alpha = 0.9;
				space.g.removeAllListeners();
				space.g.on('pointerdown', () => {
					this.move(candidate);
				});
			}
		})
	}

	showAttack() {
		this.playArea.clear();

		const {x, y} = this.position;

		const candidates = [
			{x: x - 1, y: y - ((x - 1) % 2 === 0 ? 0 : 1) },
			{x: x - 1, y: y + ((x - 1) % 2 === 0 ? 1 : 0) },
			{x: x    , y: y + 1},
			{x: x    , y: y - 1},
			{x: x + 1, y: y - ((x + 1) % 2 === 0 ? 0 : 1)},
			{x: x + 1, y: y + ((x + 1) % 2 === 0 ? 1 : 0)}
		];

		candidates.forEach(candidate => {
			if(candidate.x >= 0 && candidate.x < 5 &&
			   candidate.y >= 0 && candidate.y < (candidate.x % 2 === 0 ? 5 : 4)) {
				let space = this.playArea.space(candidate);
				space.color = hsl(0, 100, 70);
				space.g.alpha = 0.9;
				space.g.removeAllListeners();
				space.g.on('pointerdown', () => {
					this.attack(candidate);
				});
			}
		})
	}

	showBrag() {
		this.playArea.clear();
		let space = this.playArea.space(this.position);
		space.color = hsl(288, 100, 70);
		space.g.alpha = 0.9;
		space.g.removeAllListeners();
		space.g.on('pointerdown', () => {
			this.brag();
		});
	}

	showDefend() {
		this.playArea.clear();
		let space = this.playArea.space(this.position);
		space.color = hsl(216, 100, 70);
		space.g.alpha = 0.9;
		space.g.removeAllListeners();
		space.g.on('pointerdown', () => {
			this.defend();
		});
	}
}

export class PlayerCharacter extends Ninja {
	maxHp = 5;
	hp = this.maxHp;

	position: {x: number, y: number} = {x: 2, y: 4};

	constructor(scene: THREE.Scene, playArea: PlayArea) {
		const texture = new THREE.TextureLoader().load('ninja.png'); //@ts-ignore
		const material = new THREE.MeshToonMaterial({ map: texture, side: THREE.DoubleSide, skinning: true });

		super(material, scene, playArea, () => {
			this.scene.rotation.y = MathUtils.degToRad(180);
		});
	}

	restart() {
		this.playArea.space(this.position).occupied = null;
		this.position = {x: 2, y: 4};
		this.scene.position.copy(this.position3d);
		this.scene.rotation.set(0, MathUtils.degToRad(180), 0);
		this.hp = this.maxHp;
		this.bragged = false;
		this.defending = false;
		this.playArea.space(this.position).occupied = this;
	}
}

export class EnemyCharacter extends Ninja {
	maxHp = 10;
	hp = this.maxHp;

	position: {x: number, y: number} = {x: 2, y: 0};
	playerCharacter: PlayerCharacter;

	constructor(scene: THREE.Scene, playArea: PlayArea, playerCharacter: PlayerCharacter) {
		const texture = new THREE.TextureLoader().load('enemy.png'); //@ts-ignore
		const material = new THREE.MeshToonMaterial({ map: texture, side: THREE.DoubleSide, skinning: true });

		super(material, scene, playArea, () => {
			this.scene.rotation.y = MathUtils.degToRad(0);
		});

		this.playerCharacter = playerCharacter;
	}

	takeTurn() {
		const distance = this.position3d.distanceTo(this.playerCharacter.position3d);
		
		if(distance > 4) {
			this.showMove();
			setTimeout(() => {
				this.move(this.playArea.findClosestTo(this.playerCharacter.position));
			}, 1000);
		} else {
			const action = Math.floor(Math.random() * 6);

			switch(action) {
				case 0:
					this.showMove();
					setTimeout(() => {
						this.move(this.playArea.findClosestTo(this.playerCharacter.position));
					}, 1000);
					break;
				case 1:
					this.showBrag();
					setTimeout(() => {
						this.brag();
					}, 1000);
					break;
				case 2:
					this.showDefend();
					setTimeout(() => {
						this.defend();
					}, 1000);
					break;
				default:
					this.showAttack();
					setTimeout(() => {
						this.attack(this.playArea.findClosestTo(this.playerCharacter.position));
					}, 1000);
					break;
			}
		}
	}

	restart() {
		this.playArea.space(this.position).occupied = null;
		this.position = {x: 2, y: 0};
		this.scene.position.copy(this.position3d);
		this.scene.rotation.set(0, 0, 0);
		this.hp = this.maxHp;
		this.bragged = false;
		this.defending = false;
		this.playArea.space(this.position).occupied = this;
	}
}