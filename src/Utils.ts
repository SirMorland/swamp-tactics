import { Vector3 } from "three";

export function position2dTo3d(position: {x: number, y: number}) {
	return new Vector3(
		(position.x - 2) * 3,
		0,
		(position.y - 2 + (0.5 / Math.PI * Math.asin(Math.sin(Math.PI * (position.x + 1.5)))) + 0.25) * 2 * 1.732051
	);
}

/* w3color.js ver.1.18 by w3schools.com (Do not remove this line)*/
export function hsl(h, s, l) {
	var t1, t2, r, g, b;
	h = h / 60;
	s = s / 100;
	l = l / 100;
	if ( l <= 0.5 ) {
		t2 = l * (s + 1);
	} else {
		t2 = l + s - (l * s);
	}
	t1 = l * 2 - t2;
	r = Math.round(hueToRgb(t1, t2, h + 2) * 255);
	g = Math.round(hueToRgb(t1, t2, h) * 255);
	b = Math.round(hueToRgb(t1, t2, h - 2) * 255);

	return r * 0x10000 + g * 0x100 + b;
}
function hueToRgb(t1, t2, hue) {
	if (hue < 0) hue += 6;
	if (hue >= 6) hue -= 6;
	if (hue < 1) return (t2 - t1) * hue + t1;
	else if(hue < 3) return t2;
	else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
	else return t1;
}