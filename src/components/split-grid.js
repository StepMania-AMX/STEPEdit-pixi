import {PixiComponent} from '@pixi/react';
import padStart from 'lodash.padstart';
import {Container, Graphics, Text} from 'pixi.js';

const backgroundColors = [
  0xffffee,
  0xeeffff,
  0xeeffee,
  0xffeeff,
];

const beatHeight = 60;
const columnWidth = 50;
const noteWidth = 64;
const speed = 2;

export default PixiComponent('SplitGrid', {
  create: () => new Container(),
  applyProps: (container, oldProps, newProps) => {
    container.removeChildren();
    const graphics = container.addChild(new Graphics());
    const {
      beatMeasure,
      beatSplit,
      blockData,
      blockIndex,
      blockMaxLength,
      columns,
      measureMaxLength,
      numBlocks,
      numRows,
      sidebarWidth,
      splitIndex,
      splitMaxLength,
      startMeasure,
    } = newProps;
    let {x, y} = newProps;
    const backgroundColor =
        backgroundColors[splitIndex % backgroundColors.length];
    const width = sidebarWidth.left + (columns * columnWidth) +
        ((noteWidth - columnWidth) * 2) + (columns % 2 === 0 ? 20 : 0);
    const height = (beatHeight * speed) * (numRows / beatSplit);
    x -= width / 2;

    // Split Background
    graphics.beginFill(backgroundColor);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();

    // Sidebar (Left) Background
    graphics.beginFill(0xeeeeee);
    graphics.drawRect(x, y, sidebarWidth.left, height);
    graphics.endFill();

    // Sidebar (Right) Background
    graphics.beginFill(0xffffff);
    graphics.drawRect(x + width, y, sidebarWidth.right, height);
    graphics.endFill();

    // // Column lines
    // graphics.lineStyle(1, 0x222288);
    // for (let c = 1; c < columns; c++) {
    //   const lineX = sidebarWidth.left + (noteWidth - columnWidth) +
    //       (c * columnWidth) + (columns % 2 === 0 ? 10 : 0);
    //   graphics.moveTo(x + lineX, y);
    //   graphics.lineTo(x + lineX, y + height);
    // }

    // Beat lines
    const beats = Math.floor(numRows / beatSplit);
    graphics.lineStyle(1, 0x222288);
    for (let b = 1; b <= beats; b++) {
      const lineX = x + sidebarWidth.left;
      const lineWidth = width - sidebarWidth.left;
      const lineY = y + (b * beatHeight * speed);
      graphics.moveTo(lineX + 0.001, lineY + 0.001);
      graphics.lineTo(lineX + lineWidth, lineY);
    }

    // 1/2 beat lines
    graphics.lineStyle(1, 0x222288, 0.5);
    for (let b = 0; b < beats; b++) {
      let lineX = x + sidebarWidth.left;
      const lineWidth = width - sidebarWidth.left;
      const lineY = y + (b * beatHeight * speed) + (beatHeight * speed * 0.5);
      const sections = columns * 8 + 1;
      const sectionWidth = lineWidth / sections;
      for (let i = 0; i < sections; i++) {
        if (i % 2 === 0) {
          graphics.moveTo(lineX + 0.001, lineY + 0.001);
          graphics.lineTo(lineX + sectionWidth, lineY);
        }
        lineX += sectionWidth;
      }
    }

    // // 1/4 beat lines
    // graphics.lineStyle(1, 0x222288, 0.5);
    // for (let b = 0; b < beats; b++) {
    //   let lineX = x + sidebarWidth.left;
    //   const lineWidth = width - sidebarWidth.left;
    //   const lineY = y + (b * beatHeight * speed) + (beatHeight * speed *
    //   0.25); const lineY2 = lineY + beatHeight * speed * 0.5; const sections
    //   = columns * 16 + 1; const sectionWidth = lineWidth / sections; for (let
    //   i = 0; i < sections; i++) {
    //     if (i % 2 === 0) {
    //       graphics.moveTo(lineX + 0.001, lineY + 0.001);
    //       graphics.lineTo(lineX + sectionWidth, lineY);
    //       graphics.moveTo(lineX + 0.001, lineY2 + 0.001);
    //       graphics.lineTo(lineX + sectionWidth, lineY2);
    //     }
    //     lineX += sectionWidth;
    //   }
    // }

    // Sidebar line
    graphics.lineStyle(1, 0xff0000);
    graphics.moveTo(x + sidebarWidth.left, y);
    graphics.lineTo(x + sidebarWidth.left, y + height);

    // Middle lines (double steps)
    graphics.lineStyle(1, 0xff0000);
    if (columns % 2 === 0) {
      const middle = sidebarWidth.left + ((width - sidebarWidth.left) / 2);
      graphics.moveTo(x + middle, y);
      graphics.lineTo(x + middle, y + height);
    }

    // Measure lines
    const measures = Math.ceil(numRows / (beatSplit * beatMeasure));
    graphics.lineStyle(1, 0x222288);
    for (let m = 1; m < measures; m++) {
      const lineX = x;
      const lineWidth = width;
      const lineY = y + (m * beatHeight * speed * beatMeasure);
      graphics.moveTo(lineX + 0.001, lineY + 0.001);
      graphics.lineTo(lineX + lineWidth, lineY);
    }

    // Measure numbers
    const measureTextStyle = {
      fill: 0x000000,
      fontFamily: 'Open Sans',
      fontSize: 16,
      fontWeight: 'bold',
    };
    const blockTextStyle = {
      fill: 0xff0000,
      fontFamily: 'Open Sans',
      fontSize: 16,
      fontWeight: 'bold',
    };
    const splitTextStyle = {
      fill: 0xaaaaaa,
      fontFamily: 'Open Sans',
      fontSize: 16,
      fontWeight: 'bold',
    };
    for (let m = 0; m < measures; m++) {
      const measureText = container.addChild(new Text(
          padStart(m + startMeasure, measureMaxLength, '0'), measureTextStyle));
      measureText.anchor.set(0.5, 0.5);
      measureText.x = x + (sidebarWidth.left / 2);
      measureText.y = y + (m * beatHeight * speed * beatMeasure) + 17;
      const blockText = container.addChild(new Text(
          padStart(`${blockIndex + 1} / ${numBlocks}`, blockMaxLength, '0'),
          blockTextStyle));
      blockText.anchor.set(0.5, 0.5);
      blockText.x = x + (sidebarWidth.left / 2);
      blockText.y = y + (m * beatHeight * speed * beatMeasure) + 46;
      const splitText = container.addChild(new Text(
          padStart(splitIndex + 1, splitMaxLength, '0'), splitTextStyle));
      splitText.anchor.set(0.5, 0.5);
      splitText.x = x + (sidebarWidth.left / 2);
      splitText.y = y + (m * beatHeight * speed * beatMeasure) + 75;
    }

    const blockDataTextStyle = {
      fill: 0x000000,
      fontFamily: 'Open Sans',
      fontSize: 14,
      fontWeight: 'normal',
    };
    const blockDataText =
        container.addChild(new Text(blockData, blockDataTextStyle));
    blockDataText.x = x + width + 10;
    blockDataText.y = y + 10;

    // Split lines
    graphics.lineStyle(1, 0xff0000);
    graphics.moveTo(x, y);
    graphics.lineTo(x, y + height);
    graphics.lineTo(x + width, y + height);
    graphics.lineTo(x + width, y + 0.001);
    graphics.lineTo(x, y + 0.001);
    graphics.lineTo(x + width + sidebarWidth.right, y);
  }
});
