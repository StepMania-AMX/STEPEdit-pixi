import {PixiComponent} from '@pixi/react';
import {AnimatedSprite, Assets, Container, Texture} from 'pixi.js';

const numFrames = 6;

export default PixiComponent('NoteComponent', {
  create: () => new Container(),
  applyProps: (container, oldProps, newProps) => {
    container.removeChildren();
    const {anchor = [0.5, 0.5], x = 0, y = 0} = newProps;
    container.anchor = anchor;
    container.x = x;
    container.y = y;

    const {col, skin, type} = newProps;
    const textures = [];
    for (let frame = 0; frame < numFrames; frame++) {
      textures.push(Texture.from(`${skin}_${type}_${col}_F${frame}.png`));
    }
    const animatedSprite = container.addChild(new AnimatedSprite(textures));
    animatedSprite.animationSpeed = 0.25;
    animatedSprite.play();
  },
});

export const loadAssets = (skin = '00') => Assets.load([
  `noteskin/${skin}/0.frames.json`,
  `noteskin/${skin}/1.frames.json`,
  `noteskin/${skin}/2.frames.json`,
  `noteskin/${skin}/3.frames.json`,
  `noteskin/${skin}/4.frames.json`,
  `noteskin/${skin}/5.frames.json`,
  `noteskin/${skin}/6.frames.json`,
  `noteskin/${skin}/base.frames.json`,
  `noteskin/${skin}/hd1.frames.json`,
  `noteskin/${skin}/hd2.frames.json`,
  `noteskin/${skin}/stepfx0.frames.json`,
  `noteskin/${skin}/stepfx1.frames.json`,
  `noteskin/${skin}/stepfx2.frames.json`,
  `noteskin/${skin}/stepfx3.frames.json`,
  `noteskin/${skin}/stepfx4.frames.json`,
]);
