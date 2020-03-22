/*
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

import React, { Component } from 'react'
import './App.css'
import axios from 'axios'
import Options from './Options';


const BAD_INPUT_MSG = "Empty Display Name or Color Num not a number"
const GOOD_INPUT_MSG = "Let's GO!"

class App extends Component {
  constructor () {
    super()
    this.state = {
      load_options: false,
      user_msg: ''
    }  
    this.handleClick = this.handleClick.bind(this)
  }
  
  validateInput() {
    var disp_name = this.refs.disp_name.value;
    var color_num = this.refs.color_num.value;
    if (color_num.trim() === "" || isNaN(color_num) || disp_name.trim() === "") {
      return false;
    }
    return true;
  }

  handleClick () {
    if (!this.validateInput()) {
      this.setState({user_msg: BAD_INPUT_MSG});
      return;
    }
    this.setState({user_msg: GOOD_INPUT_MSG});
    this.setState({load_options: true});
    /*
    axios.get('https://api.github.com/users/maecapozzi')
      .then(response => this.handleResponse(response));
      */
  }
  
  handleResponse(res) {
    console.log(res);
    this.setState({username: res.data.name});
  }

  render () {
    if (this.state.load_options) {
      return (
        <div className='main__container'>
          <Options />
        </div>
      )
    }
    else {
      return (
        <div className='main__container'>
          Display Name: <input type="text" ref="disp_name" /><br/>
          How many colors are you wearing: <input type="text" ref="color_num" /><br/><br/>
          <button className='button' onClick={this.handleClick}>
            Lets Start!
          </button>
          <p>{this.state.user_msg}</p>
        </div>
      )
    }
  }
}
export default App
