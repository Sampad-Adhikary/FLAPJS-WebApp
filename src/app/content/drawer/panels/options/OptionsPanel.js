import React from 'react';
import '../Panel.css';
import './OptionsPanel.css';

import Config from 'config.js';
import { saveConfig } from 'config.js';

import LocalSave from 'system/localsave/LocalSave.js';
import * as ColorHelper from 'util/ColorHelper.js';
import StyleOptionRegistry from 'system/styleopt/StyleOptionRegistry.js';
import StyleInput from 'system/styleopt/components/StyleInput.js';

import OptionGroup from './OptionGroup.js';
import OptionHotkey from './OptionHotkey.js';

//This should be the same as the one referred to by index.js
const LOCAL_STORAGE_ID = "skipWelcome";

class OptionsPanel extends React.Component
{
  constructor(props)
  {
    super(props)

    this.container = React.createRef();
    this.styleOpts = new StyleOptionRegistry();

    this.state = {
      theme: "default",
      customTheme: false,
      skipWelcome: LocalSave.getStringFromStorage(LOCAL_STORAGE_ID) == "true"
    };

    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangeModule = this.onChangeModule.bind(this);
  }

  //Override
  componentDidMount()
  {
    const root = document.getElementById("root");
    const opts = this.styleOpts;

    const invertFunc = function(opt, value) {
      const color = [];
      ColorHelper.HEXtoRGB(value, color);
      ColorHelper.invertRGB(color, false, color);
      const result = ColorHelper.RGBtoHEX(color);
      //Set style
      opts.getOptionByProp(opt.prop + "-invert").setStyle(result);
    };

    const darkFunc = function(opt, value) {
      //v < 0.15 ? lighten : darken
      const color = [];
      const inverted = [];
      ColorHelper.HEXtoRGB(value, color);
      ColorHelper.invertRGB(color, true, inverted);
      ColorHelper.blendRGB(0.2, color, inverted, color);
      const result = ColorHelper.RGBtoHEX(color);
      //Set style
      opts.getOptionByProp(opt.prop + "-dark").setStyle(result);
    };

    const subtleFunc = function(opt, value)
    {
      //v < 0.15 ? lighten : darken
      const color = [];
      const inverted = [];
      ColorHelper.HEXtoRGB(value, color);
      ColorHelper.invertRGB(color, true, inverted);
      ColorHelper.blendRGB(0.39, color, inverted, color);
      const result = ColorHelper.RGBtoHEX(color);
      //Set style
      opts.getOptionByProp(opt.prop + "-subtle").setStyle(result);
    };

    const ghostFunc = function(opt, value)
    {
      //v < 0.15 ? lighten : darken
      const color = [];
      const inverted = [];
      ColorHelper.HEXtoRGB(value, color);
      ColorHelper.invertRGB(color, true, inverted);
      ColorHelper.blendRGB(0.26, color, inverted, color);
      const result = ColorHelper.RGBtoHEX(color);
      //Set style
      opts.getOptionByProp(opt.prop + "-ghost").setStyle(result);
    };

    const backFunc = function(opt, value)
    {
      //v < 0.15 ? lighten : darken
      const color = [];
      const inverted = [];
      ColorHelper.HEXtoRGB(value, color);
      ColorHelper.invertRGB(color, true, inverted);
      ColorHelper.blendRGB(0.13, color, inverted, color);
      const result = ColorHelper.RGBtoHEX(color);
      //Set style
      opts.getOptionByProp(opt.prop + "-back").setStyle(result);
    };

    //Toolbar
    opts.registerStyleOption(root, "--color-toolbar-main", "color", "toolbar", darkFunc);
    opts.registerStyleOption(root, "--color-toolbar-main-dark", "color", "hidden");
    opts.registerStyleOption(root, "--color-toolbar-accent", "color", "toolbar", darkFunc);
    opts.registerStyleOption(root, "--color-toolbar-accent-dark", "color", "hidden");
    opts.registerStyleOption(root, "--color-toolbar-text", "color", "toolbar", invertFunc);
    opts.registerStyleOption(root, "--color-toolbar-text-invert", "color", "hidden");

    //Drawer
    opts.registerStyleOption(root, "--color-drawer-main", "color", "drawer", darkFunc);
    opts.registerStyleOption(root, "--color-drawer-main-dark", "color", "hidden");
    opts.registerStyleOption(root, "--color-drawer-accent", "color", "drawer");
    opts.registerStyleOption(root, "--color-drawer-text", "color", "drawer", (...args) => {
      subtleFunc(...args);
      ghostFunc(...args);
      invertFunc(...args);
      backFunc(...args);
    });
    opts.registerStyleOption(root, "--color-drawer-text-subtle", "color", "hidden");
    opts.registerStyleOption(root, "--color-drawer-text-ghost", "color", "hidden");
    opts.registerStyleOption(root, "--color-drawer-text-invert", "color", "hidden");
    opts.registerStyleOption(root, "--color-drawer-text-back", "color", "hidden");
    opts.registerStyleOption(root, "--color-drawer-error", "color", "drawer");

    //Testing
    opts.registerStyleOption(root, "--color-testing-success", "color", "testing");
    opts.registerStyleOption(root, "--color-testing-failure", "color", "testing");
    opts.registerStyleOption(root, "--color-testing-working", "color", "testing");
    opts.registerStyleOption(root, "--color-testing-text", "color", "testing");

    //Notification
    opts.registerStyleOption(root, "--color-notification-text", "color", "notification");
    opts.registerStyleOption(root, "--color-notification-info", "color", "notification", darkFunc);
    opts.registerStyleOption(root, "--color-notification-info-dark", "color", "hidden");
    opts.registerStyleOption(root, "--color-notification-error", "color", "notification", darkFunc);
    opts.registerStyleOption(root, "--color-notification-error-dark", "color", "hidden");
    opts.registerStyleOption(root, "--color-notification-warning", "color", "notification", darkFunc);
    opts.registerStyleOption(root, "--color-notification-warning-dark", "color", "hidden");

    //Workspace
    opts.registerStyleOption(root, "--color-graph-node", "color", "workspace");
    opts.registerStyleOption(root, "--color-workspace-text", "color", "workspace");
    opts.registerStyleOption(root, "--color-workspace-main", "color", "workspace");

    //Label editor
    opts.registerStyleOption(root, "--color-labeleditor-text", "color", "labeleditor");
    opts.registerStyleOption(root, "--color-labeleditor-main", "color", "labeleditor");

    //Viewport
    opts.registerStyleOption(root, "--color-viewport-error", "color", "viewport");
    opts.registerStyleOption(root, "--color-viewport-testing", "color", "viewport");
    opts.registerStyleOption(root, "--color-viewport-warning", "color", "viewport");
    opts.registerStyleOption(root, "--color-highlight-select", "color", "viewport");

    opts.initialize();

    LocalSave.registerHandler(this);
    this.onLoadSave();
  }

  //Override
  componentWillUnmount()
  {
    registry.terminate();

    LocalSave.unregisterHandler(this);
  }

  onLoadSave()
  {
    const opts = this.styleOpts;
    const data = LocalSave.loadFromStorage("prefs-color");
    for(let prop in data)
    {
      const opt = opts.getOptionByProp(prop);
      if (opt)
      {
        opt.setStyle(data[prop]);
      }
    }
  }

  onAutoSave()
  {
    const opts = this.styleOpts;
    const data = {};
    for(let opt of opts.getOptions())
    {
      if (!opt.isDefaultStyle())
      {
        data[opt.prop] = opt.getStyle();
      }
    }
    LocalSave.saveToStorage("prefs-color", data);
  }

  onChangeTheme(e)
  {
    const prevTheme = this.state.theme;
    const theme = e.target.value;
    if (prevTheme === theme) return;

    if (theme === "default")
    {
      for(let option of this.styleOpts.getOptions())
      {
        option.resetStyle();
      }
    }

    this.setState({theme: theme});
  }

  onChangeModule(e)
  {
    //Nothing yet...
  }

  //Override
  render()
  {
    const root = document.getElementById("root");
    const opts = this.styleOpts;

    return <div className="panel-container" id="option" ref={ref=>this.container=ref} style={this.props.style}>
      <div className="panel-title">
        <h1>{I18N.toString("component.options.title")}</h1>
      </div>
      <div className="panel-content">

        <OptionGroup title={I18N.toString("component.workspace.title")} label={I18N.toString("options.category.shortcuts")}>
          <OptionHotkey label={I18N.toString("action.toolbar.savemachine")} keyName="Ctrl + S"/>
          <OptionHotkey label={I18N.toString("action.toolbar.undo.label")} keyName="Ctrl + Z"/>
          <OptionHotkey label={I18N.toString("action.toolbar.redo.label")} keyName="Ctrl + Shift + Z"/>
          <OptionHotkey label={I18N.toString("action.toolbar.saveimage")} keyName="Ctrl + P"/>
        </OptionGroup>

        <OptionGroup title={I18N.toString("component.testing.title")} label={I18N.toString("options.category.shortcuts")}>
          <OptionHotkey label={"Add test input"} keyName="Enter"/>
          <OptionHotkey label={"Run test input"} keyName="Shift + Enter"/>
        </OptionGroup>

        <OptionGroup title={I18N.toString("component.labeleditor.title")} label={I18N.toString("options.category.shortcuts")}>
          <OptionHotkey label={I18N.toString("action.workspace.submit.label")} keyName="Enter"/>
          <OptionHotkey label={I18N.toString("action.workspace.cancel.label")} keyName="Escape"/>
        </OptionGroup>

        <div className="panel-checkbox" style={{marginTop: "10px"}}>
          <input id="option-skipwelcome" type="checkbox" checked={this.state.skipWelcome}
          onChange={(e) => {
            const result = e.target.checked;
            this.setState({skipWelcome: e.target.checked});
            LocalSave.setStringToStorage(LOCAL_STORAGE_ID, "" + result);
          }}/>
          <label htmlFor="option-skipwelcome">{I18N.toString("options.skipwelcome")}</label>
        </div>

        <hr/>

        <div>
          <div id="options-theme-select-container">
            <label htmlFor="options-theme-select">Theme</label>
            <select id="options-theme-select" className="panel-select" value={this.state.theme} onChange={this.onChangeTheme} disabled={this.state.customTheme}>
              <option value="default">Default</option>
              <option value="ucsd" disabled={true}>UC San Diego (Coming Soon)</option>
              <option value="duke" disabled={true}>Duke University (Coming Soon)</option>
            </select>
            {
              !this.state.customTheme &&
              <button className="panel-button" onClick={() => this.setState({customTheme: true})}>
                {I18N.toString("action.options.changetheme")}
              </button>
            }
          </div>
          {
            this.state.customTheme && <div>
              <OptionGroup title={I18N.toString("component.toolbar.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("toolbar").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("component.drawer.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("drawer").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("component.testing.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("testing").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("component.notification.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("notification").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("component.graph.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("workspace").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("component.labeleditor.title")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("labeleditor").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <OptionGroup title={I18N.toString("options.category.general")} label={I18N.toString("options.category.colors")}>
              { opts.getPropsByGroup("viewport").map(e => <div key={e}>
                  <StyleInput className="option-container" value={opts.getOptionByProp(e)} title={I18N.toString("options." + e)}/>
                </div>) }
              </OptionGroup>

              <button className="panel-button" onClick={(e) => {
                for(let option of this.styleOpts.getOptions())
                {
                  option.resetStyle();
                }
                this.setState({customTheme: false});
              }}>{I18N.toString("action.options.reset")}</button>
            </div>
          }
        </div>

        <hr/>

        <div>
          <h2>Experimental</h2>
          <label htmlFor="options-experimental-modules">Module</label>
          <select id="options-experimental-modules" className="panel-select" value={this.props.currentModule.getModuleName()} onChange={this.onChangeModule}>
            <option value="fsa">Finite State Automata</option>
            <option value="pda" disabled={true}>Pushdown Automata (Coming Soon)</option>
            <option value="cfg" disabled={true}>Context-Free Grammar (Future)</option>
            <option value="tm" disabled={true}>Turing Machine (Future)</option>
            <option value="rdt" disabled={true}>Red-Black Tree (Future)</option>
            <option value="hlsm" disabled={true}>High Level State Machine (Future)</option>
          </select>
        </div>

      </div>

      <div className="panel-bottom"></div>
    </div>;
  }
}
OptionsPanel.UNLOCALIZED_NAME = "component.options.title";

export default OptionsPanel;
