import {PixiComponent} from '@pixi/react';
import {AnimatedSprite, Assets, Container, Texture} from 'pixi.js';

export default PixiComponent('NoteSpecialComponent', {
  create: () => new Container(),
  applyProps: (container, oldProps, newProps) => {
    container.removeChildren();
    const {anchor = [0.5, 0.5], x = 0, y = 0} = newProps;
    container.anchor = anchor;
    container.x = x;
    container.y = y;

    const {type, subType, numFrames = 6} = newProps;
    const textures = [];
    for (let frame = 0; frame < numFrames; frame++) {
      textures.push(Texture.from(`${type}_${subType}_F${frame}.png`));
    }
    const animatedSprite = container.addChild(new AnimatedSprite(textures));
    animatedSprite.animationSpeed = 0.25;
    animatedSprite.play();
  },
});

export const loadAssets = () => Assets.load([
  `noteskin/DIVISION/arrow03.frames.json`,
  `noteskin/DIVISION/rank_a.frames.json`,
  `noteskin/DIVISION/rank_b.frames.json`,
  `noteskin/DIVISION/rank_c.frames.json`,
  `noteskin/ITEM/0.frames.json`,
  `noteskin/ITEM/1.frames.json`,
  `noteskin/ITEM/2.frames.json`,
  `noteskin/ITEM/3.frames.json`,
  `noteskin/ITEM/4.frames.json`,
  `noteskin/ITEM/5.frames.json`,
]);
