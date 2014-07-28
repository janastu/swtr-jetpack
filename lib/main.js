const { ActionButton } = require('sdk/ui/button/action');
const { viewFor } = require('sdk/view/core');
const { Style } = require('sdk/stylesheet/style');
const { getTabContentWindow } = require('sdk/tabs/utils');
const { data } = require('sdk/self');

const mod = require('sdk/content/mod');
const tabs = require('sdk/tabs');


// content scripts needed for the worker
let content_scripts = [
  data.url('lib/jquery-2.1.1.min.js'),
  data.url('lib/underscore-1.6.0.min.js'),
  data.url('lib/backbone-1.1.2.min.js'),
  data.url('annotator/annotator-full.js'),
  data.url('annotorious/annotorious.debug.js'),
  data.url('worker.js')
];

// low-level Style object; to be attached to content in a tab
let style = Style({
  uri: [
    data.url('annotator/annotator.min.css'),
    data.url('annotorious/annotorious.css')
  ]
});


/* core functionality */

// global var to keep state
let enabled = false;

// our worker object
let swtr_worker = null;

// toggle swtr on the current tab
let toggle = (state) => {
  if(!tabs.activeTab.url.match('http')) {
    console.log('bad URL!');
    return;
  }
  //console.log('current state', enabled);
  //console.log('toggling');
  enabled = !enabled;
  //console.log('new state', enabled);

  if(enabled) {
    toggle_ui(true);
    enable();
  }
  else {
   toggle_ui(false);
   disable();
  }
};

// toggle the state of the ActionButton
let toggle_ui = (state) => {
  // state should be a boolean argument
  if(state !== true && state !== false) {
    return;
  }
  if(state) {
    button.icon = icons_enabled; 
  }
  else {
   button.icon = icons_disabled;
  }
};

// turn on swtr
let enable = () => {
  let raw_tab = viewFor(tabs.activeTab);
  mod.attach(style, getTabContentWindow(raw_tab));
  swtr_worker = tabs.activeTab.attach({
    contentScriptFile: content_scripts
  });
  swtr_worker.port.on('annotationCreated', (type, annotation) => {
    console.log('recvd anno', type, annotation);
  });
  // try to detect when user abandons current tab and turn off swtr
  // NOTE: right now the following does not work. these don't fire when user
  // navigates away from the current tab
  swtr_worker.on('detach', () => {
    console.log('worker detached!');
    toggle_ui(false);
  });
  tabs.on('deactivate', tab => {
    console.log('tab deactivated');
    toggle_ui(false);
    disable();
  });
};

// turn off swtr
let disable = () => {
  let raw_tab = viewFor(tabs.activeTab);
  mod.detach(style, getTabContentWindow(raw_tab));
  swtr_worker.destroy();
};


/* UI of the plugin */

// icon list
const icons_enabled = {
  '16': './icons/icon-16.png',
  '32': './icons/icon-32.png',
  '64': './icons/icon-64.png'
};

const icons_disabled = {
  '16': './icons/icon-disabled-16.png',
  '32': './icons/icon-disbaled-32.png',
  '64': './icons/icon-disabled-64.png'
};

// the main button that shows up in the browser toolbar
let button = ActionButton({
  id: 'swtr-app',
  label: 'swtr - make the web sweeter',
  icon: icons_disabled,
  onClick: toggle
});

