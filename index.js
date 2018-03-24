/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
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
import {app, h} from 'hyperapp';
import {Box, BoxContainer, Input, Button} from '@osjs/gui';

const buttons = [
  [
    {name: 'ce', label: 'CE'},
    {name: 'ac', label: 'AC'},
    {name: 'percent', label: '%'},
    {name: 'plus', label: '+'}
  ],
  [
    {name: 7, label: '7'},
    {name: 8, label: '8'},
    {name: 9, label: '9'},
    {name: 'minus', label: '-'},
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

const createAnswer = entries => {
  let nt = entries[0];

  for (let i = 1; i < entries.length; i++) {
    const nextNum = entries[i + 1];
    const operation = entries[i];
    if (operation === 'plus') {
      nt += nextNum;
    } else if (operation === 'minus') {
      nt -= nextNum;
    } else if (operation === 'multiply') {
      nt *= nextNum;
    } else if (operation === 'divide') {
      nt /= nextNum;
    }
    i++;
  }

  return nt;
};

const createState = (button, state) => {
  let {entries, current, output} = state;

  switch (button.name) {
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
        current = output = createAnswer(entries);
        entries = [];
      }
      break;

    case 'decimal':
      if (String(output).indexOf('.') === -1) {
        output = current = String(output) + '.';
      }
      break;

    default:
      if (typeof button.name === 'number') {
        const val = current === null ? button.name : parseFloat([current, button.name].join(''), 10);
        current = output = val;
      } else {
        if (current !== null) {
          entries.push(current);
          entries.push(button.name);
        }
        current = null;
      }
      break;
  }

  return {entries, current, output};
};

const createButtons = actions => buttons
  .map(group => h(BoxContainer, {
    class: 'osjs-calculator-row',
    grow: 1,
    shrink: 1
  }, group.map(button => h(Button, {
    'data-button': button.name,
    label: button.label,
    onclick: ev => actions.press({button, ev})
  }))));

const view = (state, actions) => h(Box, {orientation: 'horizontal'}, [
  h(BoxContainer, {shrink: 1}, h(Input, {
    class: 'osjs-calculator-output',
    value: String(state.output),
    readOnly: true
  })),
  ...createButtons(actions)
]);

const createApplication = ($content, win) => {
  return app({
    entries: [],
    current: null,
    output: 0
  }, {
    press: ({button}) => state => createState(button, state)
  }, view, $content);
};

OSjs.make('osjs/packages').register('Calculator', (core, args, options, metadata) => {

  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  proc.createWindow({
    title: metadata.title.en_EN,
    dimension: {width: 300, height: 500}
  })
    .on('destroy', () => proc.destroy())
    .render(createApplication);

  return proc;
});
