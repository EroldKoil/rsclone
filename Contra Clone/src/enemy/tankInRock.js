/* eslint-disable */

import Weapon from '../weapon/weapon';
import Person from '../person';
import contra from '../index';

const keys = [

  'tankR0',
  'tankR30',
  'tankR60',
  'tankR90',
  'tankR120',
  'tankR150',
  'tankR180',
  'tankR210',
  'tankR240',
  'tankR270',
  'tankR300',
  'tankR330',
  'tankRClose',
  'tankROpen',
];

export default class TankInRock extends Person {
  constructor(xCenter, yBottom, level) {
    super(xCenter, yBottom, 15, level.enemiesInfo, keys, contra.res.enemyS, level);
    this.health = 10;
    this.level = level;
    this.weapon = new Weapon('E', this, 1000, 1, 1);
    this.selectState('tankRClose');
    this.aim = contra.pjs.game.newRectObject({
      x: xCenter - 10,
      y: yBottom - 25,
      w: 18,
      h: 18,
    });
    level.elementsArray.push(this);
  }



  tryAction() {
    this.spritesMesh.draw();
    const camPos = contra.pjs.camera.getPosition().x;
    if (!this.started && camPos > this.xCenter - 240) {
      this.open();
    } else {
      this.tryRemove(camPos);
    }

    if (this.started) {
      let deg = this.getDegree(30);
      if (`tankR${deg}` !== this.selectedState.name) {
        this.selectState(`tankR${deg}`);
      }
      deg = Math.PI / 180 * deg;
      this.aim.drawStaticBox();
      if (this.weapon.canShoot) {
        this.weapon.shoot(deg, this.xCenter + Math.cos(deg) * 16, this.yBottom - 16 - Math.sin(deg) * 16);
      }
    }
  }
  getSprites() {
    //  return [...this.sprites, ...this.boomSprites];
  }

  open() {
    this.selectState('tankROpen');
    setTimeout(() => {
      this.selectState('tankR180');
      this.started = true;
    }, 300);
  }

}