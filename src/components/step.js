import {Container} from '@pixi/react';
import React, {Component} from 'react';

import * as _ from '../data/_common';
import ClickSubscriber from '../util/click-subscriber';

import HoldComponent from './hold';
import NoteComponent from './note';
import NoteSpecialComponent from './note-special';
import SplitGrid from './split-grid';

const beatHeight = 60;
const columnWidth = 50;
const noteHeight = 64;
const noteWidth = 64;
const speed = 2;

const divisionId = _.NoteTypes.indexOf('division');
const itemId = _.NoteTypes.indexOf('item');
const subTypeA = _.NoteDivisionNames.indexOf('A');

const cols = [
  'DOWNLEFT',
  'UPLEFT',
  'CENTER',
  'UPRIGHT',
  'DOWNRIGHT',
];

const offsetsByCol = {
  5: [
    -100,
    -50,
    0,
    50,
    100,
  ],
  6: [
    -235,
    -185,
    -135,
    -85,
    -35,
    35,
    85,
    135,
    185,
    235,
  ],
  10: [
    -235,
    -185,
    -135,
    -85,
    -35,
    35,
    85,
    135,
    185,
    235,
  ],
};

const isNoteOutOfBounds = (x, y, clientX, clientY) =>
    !isInBounds(x, y, noteWidth, noteHeight, clientX, clientY);

const isInBounds = (x, y, width, height, clientX, clientY) => clientX >= x &&
    clientX <= (x + width) && clientY >= y && clientY <= (y + height);

export default class StepComponent extends Component {
  clickHandlers = [];
  state = {
    components: [],
    showMetaData: false,
  };

  constructor(props) {
    super(props);
    const originalSetState = this.setState;
    this.setState = (state) => Object.assign(this.state, state);
    this.setStep(this.props.step, true);
    this.setState = originalSetState;
  }

  componentWillUpdate(newProps) {
    if (newProps.step !== this.props.step) {
      const {step} = newProps;
      this.setStep(step);
    }
  }

  render() {
    const {components} = this.state;
    return (
      <Container y={this.props.y}>
        {components.map(({componentType, props}, key) => React.createElement(componentType, { key, ...props }))}
      </Container>
    );
  }

  setStep(step) {
    console.log('Step Metadata:');
    console.dir(step.metadata);
    this.setStyle(step);
    for (const handler of this.clickHandlers) {
      ClickSubscriber.unsubscribe(handler);
    }
    this.clickHandlers.length = 0;
    const components = this.updateComponentData(step);
    this.setState({ step, components });
  }

  setStyle(step) {
    // TODO: Receptors
    switch (step.styleType) {
      case 'Light Map':
        this.columns = 3;
        break;

      case 'Single':
        this.columns = 5;
        break;

      case 'Half Double':
        this.columns = 10;
        break;

      case 'Double':
        this.columns = 10;
        break;

      default:
        throw new Error(`Unrecognized style type: ${step.styleType}`);
    }
  }

  showMetaData(showMetaData) {
    this.setState({showMetaData});
  }

  updateComponentData(step) {
    const components = [];
    this.updateSplitGrid(components, step);
    this.updateNotes(components, step);
    return components;
  }

  updateNotes(components, step) {
    const activeHoldProps = new Map();
    let splitGridY = 0;
    for (const split of step.splits) {
      const {beatSplit, numRows} = split.activeBlock;
      for (const [rowIndex, row] of split.activeBlock.rows.entries()) {
        for (const [column, note] of row.entries()) {
          const x = this.props.x + offsetsByCol[this.columns][column];
          const y = splitGridY + beatHeight * speed * (rowIndex / beatSplit);
          const onClickNote = ({clientX, clientY}) => {
            clientY -= this.props.y;
            if (isNoteOutOfBounds(x, y, clientX, clientY)) {
              return;
            }
            const unrecognized = [
              '---',
              `Unrecognized Data (Display): ${note.rawDisplayUnrecognized}`,
              `Unrecognized Data (Brain Shower): ${note.rawBrainShower}`,
            ].join('\n');
            alert(`Position: row ${rowIndex}, col ${column}\n${note}\n${
                unrecognized}`);
          };
          this.clickHandlers.push(onClickNote);
          ClickSubscriber.subscribe(onClickNote);
          if (!_.NoteTypesRegular.includes(note.type)) {
            if (note.type === itemId) {
              const componentData = {
                componentType: NoteSpecialComponent,
                props: {
                  type: 'ITEM',
                  subType: _.NoteItemSprites[note.subType],
                  x,
                  y,
                },
              };
              components.push(componentData);
            } else if (note.type === divisionId) {
              const componentData = {
                componentType: NoteSpecialComponent,
                props: {
                  type: 'DIVISION',
                  subType: _.NoteDivisionNames[note.subType],
                  numFrames: note.subType >= subTypeA ? 1 : 6,
                  x,
                  y,
                },
              };
              components.push(componentData);
            }
          } else if (_.NoteTypesHold.includes(note.type)) {
            const isHead = note.type === _.NoteTypesHold[0];
            const isTail = note.type === _.NoteTypesHold[2];
            if (isHead || !activeHoldProps.has(column)) {
              const componentData = {
                componentType: HoldComponent,
                props: {
                  skin: 'SKIN00',
                  type: note.canHold ? 'HOLD' : 'ROLL',
                  col: cols[column % cols.length],
                  height: 0,
                  x,
                  y,
                },
              };
              activeHoldProps.set(column, componentData.props);
              components.push(componentData);
            } else {
              const props = activeHoldProps.get(column);
              const y =
                  splitGridY + beatHeight * speed * (rowIndex / beatSplit);
              props.height = y - props.y;
            }
            if (isTail) {
              activeHoldProps.delete(column);
            }
          } else {
            const componentData = {
              componentType: NoteComponent,
              props: {
                skin: 'SKIN00',
                type: 'TAP',
                col: cols[column % cols.length],
                x,
                y,
              },
            };
            components.push(componentData);
          }
        }
      }
      splitGridY += beatHeight * speed * (numRows / beatSplit);
    }
  }

  updateSplitGrid(components, step) {
    let maxBlocks = 0;
    let numMeasures = 0;
    for (const split of step.splits) {
      let numMeasuresSplit = 0;
      for (const block of split.blocks) {
        numMeasuresSplit = Math.max(
            numMeasuresSplit,
            block.numRows / (block.beatSplit * block.beatMeasure));
      }
      maxBlocks = Math.max(maxBlocks, split.blocks.length);
      numMeasures += Math.ceil(numMeasuresSplit);
    }
    const sidebarWidth = {left: 60, right: 160};
    const measureMaxLength = numMeasures.toString().length;
    const blockMaxLength = maxBlocks.toString().length;
    const splitMaxLength = step.splits.length.toString().length;
    let splitGridStartMeasure = 1;
    let splitGridY = 0;
    step.splits.forEach((split, splitIndex) => {
      const {columns} = this;
      const blockData = split.activeBlock.toString();
      const blockIndex = split.activeBlockIndex;
      const numBlocks = split.blocks.length;
      const x = this.props.x;
      const y = splitGridY;
      const onClickSplit = ({clientX, clientY}) => {
        const gridWidth = sidebarWidth.left + (columns * columnWidth) +
            ((noteWidth - columnWidth) * 2) + (columns % 2 === 0 ? 20 : 0);
        clientY -= this.props.y;
        if (isInBounds(
                x - (gridWidth / 2), y, sidebarWidth.left, 96, clientX,
                clientY)) {
          split.activeBlockIndex++;
          split.activeBlockIndex %= split.blocks.length;
          if (blockIndex !== split.activeBlockIndex) {
            this.setStep(this.props.step);
          }
          return;
        }
        if (isInBounds(
                x + (gridWidth / 2), y, sidebarWidth.right, 180, clientX,
                clientY)) {
          const data = [
            `Split ${splitIndex + 1}, Block ${blockIndex + 1}/${numBlocks}`,
            '---',
            `Random Block at Step Start: ${
                _.BoolOnOffValues[split.selectRandomBlockAtStart]}`,
            `Random Block at Split Start: ${
                _.BoolOnOffValues[split.selectRandomBlockAtSplit]}`
          ];
          if (split.metadata.size > 0) {
            for (const [key, value] of split.metadata.entries()) {
              data.push(`Split Metadata, ${key}: ${value}`);
            }
          }
          if (split.activeBlock.division.size > 0) {
            data.push('---');
            for (const [key, value] of split.activeBlock.division.entries()) {
              data.push(`Division, ${key}: ${value}`);
            }
          }
          data.push(`---\n${blockData}`);
          data.push(
              ...['---',
                  `Unrecognized Data (Split, Select Block): ${
                      split.rawDataSelectBlock & 0x3f}`,
                  `Unrecognized Data (Split, Brain Shower): ${
                      split.rawDataBrainShower}`,
                  `Unrecognized Data (Split): ${split.rawDataPadding}`,
                  `Unrecognized Data (Block): ${split.activeBlock.rawPadding}`,
          ]);
          alert(data.join('\n'));
          return;
        }
      };
      this.clickHandlers.push(onClickSplit);
      ClickSubscriber.subscribe(onClickSplit);

      const {beatSplit, beatMeasure, numRows} = split.activeBlock;
      const componentData = {
        componentType: SplitGrid,
        props: {
          columns,
          blockData,
          blockIndex,
          splitIndex,
          beatSplit,
          beatMeasure,
          numBlocks,
          numRows,
          measureMaxLength,
          blockMaxLength,
          splitMaxLength,
          startMeasure: splitGridStartMeasure,
          sidebarWidth,
          x,
          y,
        },
      };
      components.push(componentData);
      splitGridStartMeasure += Math.ceil(numRows / (beatSplit * beatMeasure));
      splitGridY += beatHeight * speed * (numRows / beatSplit);
    });
  }
}
