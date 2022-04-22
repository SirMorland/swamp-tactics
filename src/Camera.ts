import { Vector3 } from "three";

export class Camera {
	_size: number = 16;
	_targetSize: number = 16;
	_position: {x: number, y: number} = {x: 2, y: 2};
	_targetPosition: {x: number, y: number} = {x: 2, y: 2};
	_lerp: number = 0;

	get size() {
		return this._size;
	}
	set size(size: number) {
		this._targetSize = size;
		this._lerp = 0;
	}

	get position() {
		return this._position;
	}
	set position(position: {x: number, y: number}) {
		this._targetPosition = position;
		this._lerp = 0;
	}

	get position3d() {
		return new Vector3(
			(this._position.x - 2) * 3,
			0,
			(this._position.y - 2) * 2 * 1.732051
		);
	}

	constructor() {
		
	}

	update(delta: number) {
		if(this._lerp + delta * 0.5 < 1) {
			this._lerp += delta * 0.5;
		} else {
			this._lerp = 1;
		}

		this._size = this._size * (1 - this._lerp) + this._targetSize * this._lerp;
		this._position.x = this._position.x * (1 - this._lerp) + this._targetPosition.x * this._lerp;
		this._position.y = this._position.y * (1 - this._lerp) + this._targetPosition.y * this._lerp;
	}
}