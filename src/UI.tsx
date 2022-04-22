import React, { useState } from 'react';

import { Camera } from './Camera';
import { TurnController } from './TurnController';
import { PlayerCharacter, EnemyCharacter, ACTION } from './GameCharacter';
import { PlayArea } from './PlayArea';

//@ts-ignore
import NinjaProfile from '../static/ninja-profile.png';
//@ts-ignore
import NinjaTail from '../static/ninja-tail.png';
//@ts-ignore
import EnemyProfile from '../static/enemy-profile.png';
//@ts-ignore
import EnemyTail from '../static/enemy-tail.png';

interface Props {
	cam: Camera,
	turnController: TurnController,
	playerCharacter: PlayerCharacter,
	enemyCharacter: EnemyCharacter,
	playArea: PlayArea,
};

const UI = ({ cam, turnController, playerCharacter, enemyCharacter, playArea }: Props) => {
	const [visible, setVisible] = useState(false);
	const [_, setRandom] = useState(0);
	const forceUpdate = () => {
		setRandom(Math.random());
	}

	React.useEffect(() => {
		setVisible(turnController.turn === playerCharacter);

		playerCharacter.onActionStarted.push((action: ACTION) => {
			switch(action) {
				case ACTION.MOVE:
					cam.size = 10;
					break;
				case ACTION.ATTACK:
					cam.size = 6;
					break;
				default:
					cam.size = 4;
					break;
			}
			
			if(playerCharacter.anotherPosition) {
				cam.position = {
					x: (playerCharacter.position.x + playerCharacter.anotherPosition.x) / 2,
					y: (playerCharacter.position.y + playerCharacter.anotherPosition.y) / 2
				};
			} else {
				cam.position = playerCharacter.position;
			}
		});
		playerCharacter.onActionUpdated.push(() => {
			forceUpdate();
		});
		playerCharacter.onActionEnded.push(() => {
			if(enemyCharacter.hp > 0) {
				cam.size = 16;
				cam.position = {x: 2, y: 2};

				turnController.turn = enemyCharacter;
				playArea.clear();
				enemyCharacter.takeTurn();
			}
		});
	
		enemyCharacter.onActionStarted.push((action: ACTION) => {
			switch(action) {
				case ACTION.MOVE:
					cam.size = 10;
					break;
				case ACTION.ATTACK:
					cam.size = 6;
					break;
				default:
					cam.size = 4;
					break;
			}
			
			if(enemyCharacter.anotherPosition) {
				cam.position = {
					x: (enemyCharacter.position.x + enemyCharacter.anotherPosition.x) / 2,
					y: (enemyCharacter.position.y + enemyCharacter.anotherPosition.y) / 2
				};
			} else {
				cam.position = enemyCharacter.position;
			}
		});
		enemyCharacter.onActionUpdated.push(() => {
			forceUpdate();
		});
		enemyCharacter.onActionEnded.push(() => {
			if(playerCharacter.hp > 0) {
				cam.size = 16;
				cam.position = {x: 2, y: 2};

				turnController.turn = playerCharacter;
				playArea.clear();
				
				setVisible(true);
			}
		});
	
		const cancelAction = () => {
			if(turnController.turn === playerCharacter && playerCharacter.hp > 0 && enemyCharacter.hp > 0) {
				cam.size = 16;
				cam.position = {x: 2, y: 2};
				
				playArea.clear();
				setVisible(true);
			}
		};
		playArea.onCancel.push(cancelAction);
	}, []);

	const move = event => {
		event.stopPropagation();

		cam.size = 10;
		cam.position = playerCharacter.position;
		playerCharacter.showMove();

		setVisible(false);
	}
	const attack = event => {
		event.stopPropagation();

		cam.size = 10;
		cam.position = playerCharacter.position;
		playerCharacter.showAttack();

		setVisible(false);
	}
	const brag = event => {
		event.stopPropagation();

		cam.size = 10;
		cam.position = playerCharacter.position;
		playerCharacter.showBrag();

		setVisible(false);
	}
	const defend = event => {
		event.stopPropagation();

		cam.size = 10;
		cam.position = playerCharacter.position;
		playerCharacter.showDefend();

		setVisible(false);
	}

	const restart = () => {
		cam.size = 16;
		cam.position = {x: 2, y: 2};
		
		playerCharacter.restart();
		enemyCharacter.restart();
		turnController.start(playerCharacter, enemyCharacter);
		if(turnController.turn === playerCharacter) {
			setVisible(true);
		} else {
			forceUpdate();
		}
	}

	return (
		<React.Fragment>
			<div id="ui">
				<div>
					<img className='profile' src={NinjaProfile}></img>
					<div className='tails'>
						{[...Array(playerCharacter.maxHp)].map((_, i) =>
							<img src={NinjaTail} key={i} className={i + 1 > playerCharacter.hp ? "lost": undefined}></img>
						)}
					</div>
				</div>
				<div>
					<img className='profile' src={EnemyProfile}></img>
					<div className='tails'>
						{[...Array(enemyCharacter.maxHp)].map((_, i) =>
							<img src={EnemyTail} key={i} className={enemyCharacter.maxHp - i > enemyCharacter.hp ? "lost": undefined}></img>
						)}
					</div>
				</div>
			</div>
			<div id="buttons" className={visible ? 'visible' : undefined}>
				<button id="move" onClick={move}>Move</button>
				<button id="attack" onClick={attack}>Attack</button>
				<button id="brag" onClick={brag}>Brag</button>
				<button id="defend" onClick={defend}>Defend</button>
			</div>
			<div id="popup" className={(playerCharacter.hp <= 0 || enemyCharacter.hp <= 0) ? "visible" : undefined} onClick={restart}>
				<div className='dialog'>
					<h1>{enemyCharacter.hp <= 0 ? "Player wins!" : "Enemy wins!"}</h1>
				</div>
			</div>
		</React.Fragment>
	);
}


export default UI;