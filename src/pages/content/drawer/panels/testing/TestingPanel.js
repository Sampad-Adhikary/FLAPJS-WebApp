import React from 'react';

import '../Panel.css';
import './TestingPanel.css';

import TestingInputList from './TestingInputList.js';

class TestingPanel extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    return <div className="panel-container" id="testing">
      <div className="panel-title">
        <h1>Testing</h1>
      </div>
      <TestingInputList tester={this.props.tester}/>
      <hr />
      <div>
        <input id="test-step" type="checkbox"/>
        <label htmlFor="test-step">Simulate Step-by-step</label>
      </div>
      <div>
        <input id="test-closure" type="checkbox"/>
        <label htmlFor="test-closure">Transition By Closure</label>
      </div>
    </div>;
  }
}

export default TestingPanel;