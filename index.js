/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import {app, h} from 'hyperapp';
import {Box, BoxContainer, TextField, Button} from '@osjs/gui';

const buttons = [
  [
    {name: 'ce', label: 'CE'},
    {name: 'ac', label: 'AC'},
    {name: 'percent', label: '%'},
    {name: 'addition', label: '+'}
  ],
  [
    {name: 7, label: '7'},
    {name: 8, label: '8'},
    {name: 9, label: '9'},
    {name: 'subtract', label: '-'},
  ],
  [
    {name: 4, label: '4'},
    {name: 5, label: '5'},
    {name: 6, label: '6'},
    {name: 'multiply', label: 'x'},
  ],
  [
    {name: 1, label: '1'},
    {name: 2, label: '2'},
    {name: 3, label: '3'},
    {name: 'divide', label: '÷'},
  ],
  [
    {name: 0, label: '0'},
    {name: 'decimal', label: '.'},
    {name: 'equal', label: '='}
  ]
];

const calculator = () => {
  let entries = [];
  let output = '';
  let current = null;

  const operators = [
    // Precendece ordered
    {
      divide: (a, b) => a / b,
      multiply: (a, b) => a * b
    },
    {
      addition: (a, b) => a + b,
      subtract: (a, b) => a - b
    }
  ];

  const answer = () => {
    let op;
    let solve = [...entries];
    let resolve = [];

    for (let i = 0; i < operators.length; i++) {
      for (let j = 0; j < solve.length; j++) {
        if (operators[i][solve[j]]) {
          op = operators[i][solve[j]];
        } else if (op) {
          resolve[resolve.length - 1] = op(
            resolve[resolve.length - 1],
            solve[j]
          );

          op = null;
        } else {
          resolve.push(solve[j]);
        }
      }

      solve = resolve;
      resolve = [];
    }

    return solve.length > 1 ? Number.NaN : solve[0];
  };

  const operation = op => {
    switch (op) {
    case 'ac':
      entries = [];
      current = null;
      output = 0;
      break;

    case 'ce':
      current = null;
      break;

    case 'equal':
      if (current !== null) {
        entries.push(current);
        current = output = answer();
        entries = [];
      }
      break;

    case 'decimal':
      if (String(output).indexOf('.') === -1) {
        output = current = String(output) + '.';
      }
      break;

    default:
      if (typeof op === 'number') {
        const val = current === null ? op : parseFloat([current, op].join(''), 10);
        current = output = val;
      } else {
        if (current !== null) {
          entries.push(current);
          entries.push(op);
        }
        current = null;
      }
      break;
    }
  };

  return {
    output: () => output,
    op: op => operation(op)
  };
};

const createButtons = actions => buttons
  .map(group => h(BoxContainer, {
    class: 'osjs-calculator-row',
    grow: 1,
    shrink: 1
  }, group.map(button => h(Button, {
    'data-button': button.name,
    'data-label': button.label,
    label: button.label,
    box: {
      grow: 1,
      shrink: 1
    },
    onclick: ev => actions.press({button, ev})
  }))));

const view = (state, actions) => h(Box, {orientation: 'horizontal'}, [
  h(TextField, {
    class: 'osjs-calculator-output',
    value: String(state.output),
    readOnly: true
  }),
  ...createButtons(actions)
]);

const createApplication = ($content, win, proc) => {
  const calc = calculator();

  app({
    output: '0'
  }, {
    press: ({button}) => state => {
      calc.op(button.name);
      return {output: String(calc.output())};
    }
  }, view, $content);

  win.on('keypress', ({key}) => {
    const found = win.$element.querySelector(`[data-label="${key}"]`);
    if (found) {
      found.click();
    }
  });

  win.focus();
};

osjs.register(applicationName, (core, args, options, metadata) => {
  const title = core.make('osjs/locale')
    .translatableFlat(metadata.title);

  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  proc.createWindow({
    title,
    id: 'Calculator',
    icon: proc.resource(metadata.icon),
    dimension: {width: 300, height: 500}
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => createApplication($content, win, proc));

  return proc;
});
