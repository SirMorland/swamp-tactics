import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { MathUtils } from 'three';

import React from 'react';
import { createRoot } from 'react-dom/client';

import UI from './UI';
import { Camera } from './Camera';
import { EnemyCharacter, PlayerCharacter } from './GameCharacter';
import { PlayArea } from './PlayArea';
import { TurnController } from './TurnController';

import './style.css';

// General

const turnController = new TurnController();
const cam = new Camera();

const resize = () => {
	const width = Math.min(window.innerWidth, 768);
	const height = window.innerHeight;

	const aspect = width / height;
	const size = cam.size;

	let pos = cam.position3d;

	let h = document.getElementById('buttons')?.clientHeight; // height - document.getElementById('buttons').getBoundingClientRect().y;

	app.resize(width, height);
	stage.x = (app.width * (0.5 - pos.x / size)) / app.resolution;
	stage.y = (app.height - app.width / 2) / app.resolution - h / 2 - pos.z / 1.732051 * app.width / size / app.resolution;
	stage.scale.x = width / size;
	stage.scale.y = width / size;

	camera.left = -size / 2;
	camera.right = size / 2;
	camera.top = size / aspect - (1 + h / width) * cam.size / 2;
	camera.bottom = -(1 + h / width) * cam.size / 2;

	camera.position.x = pos.x;
	camera.position.z = 10 + pos.z;

	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
	renderer.render(scene, camera);
};

window.addEventListener('resize', resize);

// PixiJS

const pixiCanvas = document.getElementById("pixijs") as HTMLCanvasElement;
const app = new PIXI.Renderer({
	view: pixiCanvas,
	backgroundAlpha: 0,
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio,
	autoDensity: true,
	antialias: true,
});

const stage = new PIXI.Container();
const playArea = new PlayArea(stage, turnController);

const textures = [
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/1.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/2.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/3.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/4.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/5.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/6.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/7.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/8.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/9.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Grass/10.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/1.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/2.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/3.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/4.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/5.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/6.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/7.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/8.png'),
	PIXI.Texture.from('./free-swamp-game-tileset-pixel-art/3 Objects/Bushes/9.png'),
];
for(let i = 0; i < 50; i++) {
	const sprite = new PIXI.Sprite(textures[Math.floor(Math.random() * textures.length)]);
	sprite.scale.set(0.02, 0.02);
	sprite.anchor.set(0.5, 0.5);
	sprite.position.set(Math.random() * 20 - 10, Math.random() * 16 - 8);
	stage.addChild(sprite);
}
for(let i = 0; i < 50; i++) {
	const sprite = new PIXI.Sprite(textures[Math.floor(Math.random() * textures.length)]);
	sprite.scale.set(0.02, 0.02);
	sprite.anchor.set(0.5, 0.5);
	sprite.position.set(Math.random() * 32 - 16, Math.random() * 20 - 10);
	stage.addChild(sprite);
}

const ticker = new PIXI.Ticker();
ticker.add(deltaTime => {
	app.render(stage);
});
ticker.start();

// Three.js

const threeCanvas = document.getElementById('threejs') as HTMLCanvasElement;
const scene = new THREE.Scene();

const playerCharacter = new PlayerCharacter(scene, playArea);
const enemyCharacter = new EnemyCharacter(scene, playArea, playerCharacter);

const light = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(light);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 7.071;
camera.position.z = 10;
camera.rotation.x = MathUtils.degToRad(54.73561 - 90);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
	canvas: threeCanvas,
	alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const clock = new THREE.Clock();

const tick = () => {
	const delta = clock.getDelta();

	playerCharacter.update(delta);
	enemyCharacter.update(delta);

	cam.update(delta);
	resize();

	renderer.render(scene, camera);
};

renderer.setAnimationLoop(tick);

// UI

const root = createRoot(document.getElementById('root'));
root.render(
	<UI cam={cam} turnController={turnController} playerCharacter={playerCharacter} enemyCharacter={enemyCharacter} playArea={playArea} />
);

// Generic

turnController.start(playerCharacter, enemyCharacter);