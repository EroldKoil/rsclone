import Player from './player';
import PointJS from './pointjs_0.2.0.9';
import mainMenu from './mainmenu';
import getLanguageObject from './multilang';
import Options from './options';
import Sound from './sound';
import Joystick from './joystick';

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  const wNorm = 256;
  const hNorm = 224;
  const canvas = document.querySelector('canvas');
  if (width / height > wNorm / hNorm) {
    width = (wNorm / hNorm) * height;
  } else {
    height = (width / wNorm) * hNorm;
  }
  canvas.style.width = `${width}px`;
  canvas.style.left = `${(window.innerWidth - width) / 2}px`;
  canvas.style.top = `${(window.innerHeight - height) / 2}px`;
}

Sound.init();

const contra = {
  pjs: new PointJS(256, 224, { backgroundColor: 'black' }),
  options: new Options(),
  selectedLevel: null,
  player: null,
  startGame: null,
  lang: null,
  lives: 3,
  joystick: null,
  hardLevel: 0,
  timeStart: 0,
  results: {
    miss: 0,
    bulletsCount: 0,
    score: 0,
    scoreForLife: 0,
    hiScore: 20000,
    stats: {
      gameTime: 0,
      killed: 0,
      shots: 0,
      jumps: 0,
      accuracy: 0,
    },
  },
};
export default contra;

const { pjs } = contra;

// Инициализация свойств, недоступных при создании объекта
const { newImage } = contra.pjs.tiles;
contra.res = {
  title: newImage('../assets/main_menu/menu_bg.png'),
  playerS: newImage('./assets/sprites/player/player.png'),
  levelS: [
    newImage('./assets/sprites/levels/1/spritesheet.png'),
    newImage('./assets/sprites/levels/2/spritesheet.png'),
    newImage('./assets/sprites/levels/3/spritesheet.png'),
  ],
  elementS: newImage('./assets/sprites/elements.png'),
  enemyS: newImage('./assets/sprites/enemy.png'),
  boss: newImage('./assets/sprites/boss/boss.png'),
};

contra.countAccuracy = () => {
  const res = contra.results;
  res.stats.accuracy = Math.floor(((res.bulletsCount - res.miss) / res.bulletsCount) * 100);
};

contra.countTime = () => {
  const diff = new Date().getTime() - contra.timeStart.getTime();
  contra.results.stats.gameTime = Math.floor(diff / 1000);
};
// метод сохранения хайскора
contra.startGame = () => {
  if (pjs.touchControl.isTouchSupported()) {
    contra.joystick.displayJoystick(true);
  }

  const interval = setInterval(() => {
    if (contra.pjs.resources.isLoaded()) {
      clearInterval(interval);
      Sound.playMusic(contra.selectedLevel.levelNumber + 1, contra.options.get('musicVolume'));
      pjs.camera.setPosition(pjs.vector.point(0, 0));
      if (contra.player) {
        const { player } = contra;
        player.reBurn();
        player.setLevel(contra.selectedLevel);
      } else {
        contra.player = new Player(contra.selectedLevel);
      }

      const interval1 = setInterval(() => {
        if (contra.pjs.resources.isLoaded()) {
          clearInterval(interval1);
          contra.selectedLevel.startLevel();
        }
      }, 200);
    }
  }, 200);
};

contra.addScore = (score) => {
  contra.results.score += score;
  if (contra.results.score > contra.results.hiScore) {
    contra.results.hiScore = contra.results.score;
    contra.options.set('highScore', contra.results.hiScore);
  }
  contra.results.stats.killed += 1;
  contra.results.scoreForLife += score;
  if (contra.results.scoreForLife > 20000) {
    contra.results.scoreForLife = 0;
    Sound.play('plusLife');
    contra.lives += 1;
  }
};

contra.lang = getLanguageObject(contra.options.get('language'));

let dialogText = contra.lang.dialog;
if (pjs.touchControl.isTouchSupported()) {
  dialogText = dialogText.replace(/{{.*}}/, '');
} else {
  dialogText = dialogText.replace(/{{|}}/g, '')
    .replace(/{up}/, contra.options.get('keyUp'))
    .replace(/{down}/, contra.options.get('keyDown'))
    .replace(/{left}/, contra.options.get('keyLeft'))
    .replace(/{right}/, contra.options.get('keyRight'))
    .replace(/{fire}/, contra.options.get('keyFire'))
    .replace(/{jump}/, contra.options.get('keyJump'));
}

const dialogEl = document.querySelector('dialog');
dialogEl.innerHTML = dialogText;
dialogEl.showModal(); // Показать модальное окно

function buttonPress() {
  dialogEl.close();
  mainMenu(contra); // Все стартует отсюда!
}

// Обработчик кнопки модального окна
const startButtonEl = document.getElementById('start-button');
startButtonEl.addEventListener('click', buttonPress);
startButtonEl.addEventListener('touchend', buttonPress);

function resizeInit() {
  if (document.querySelector('canvas') === null) {
    setTimeout(resizeInit, 50);
  } else {
    window.onresize = resize;
    resize();
  }
}

window.onresize = resizeInit;

// Обработчик кнопки модального окна
startButtonEl.addEventListener('click', buttonPress);

pjs.keyControl.initControl();

if (pjs.touchControl.isTouchSupported()) {
  startButtonEl.addEventListener('touchend', buttonPress);
  pjs.touchControl.initControl();
  contra.joystick = new Joystick();
  contra.joystick.displayJoystick(false);
}

resizeInit();
