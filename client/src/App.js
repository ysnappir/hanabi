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
const WAIT_STR = "Please Wait..."

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      load_options: false,
      user_msg: ''
    }  
    this.display_name = React.createRef();
    this.color_num = React.createRef();
    this.handleClick = this.handleClick.bind(this)
  }
  
  validateInput() {
    var disp_name_val = this.display_name.current.value;
    var color_num_val = this.color_num.current.value;
    if (color_num_val.trim() === "" || isNaN(color_num_val) || disp_name_val.trim() === "") {
      return false;
    }
    return true;
  }

  handleClick () {
    if (!this.validateInput()) {
      this.setState({user_msg: BAD_INPUT_MSG});
      return;
    }
    this.setState({user_msg: WAIT_STR});

    axios.post('http://127.0.0.1:8080/register', 
      { display_name: this.display_name.current.value, 
        number_of_colors_in_clothes: this.color_num.current.value}
      ).then(response => this.handleResponse(response), reason => this.handleError(reason));
  }
  
  handleError(reason) {
    console.log(reason);
    this.setState({user_msg: "Connection Error: " + reason});
  }


  handleResponse(res) {
    console.log(res);
    this.setState({user_msg: res.data.id});
    this.setState({load_options: true});
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
          Display Name: <input type="text" ref={this.display_name} /><br/>
          How many colors are you wearing: <input type="text" ref={this.color_num} /><br/><br/>
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
