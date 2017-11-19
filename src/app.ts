import { CONFIG } from './config';
import { Game } from './game';

const renderer = new PIXI.CanvasRenderer(512, 512);
renderer.view.style.position = "fixed";
renderer.view.style.display = "block";
renderer.view.style.left = "0";
renderer.view.style.top = "0";
renderer.autoResize = true;
renderer.clearBeforeRender = false;
renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.view);

const game = new Game(Math.floor(window.innerWidth / CONFIG.CELL_SIZE), Math.floor(window.innerHeight / CONFIG.CELL_SIZE));
const worldStage = new PIXI.Container();
game.run(worldStage);
game.setInitialPopulation();
renderer.render(worldStage);


const run = () => {
  setTimeout(run, CONFIG.TIME_STEP);
  const stage = new PIXI.Container();
  game.run(stage);
  renderer.render(stage);
};
requestAnimationFrame(run);

