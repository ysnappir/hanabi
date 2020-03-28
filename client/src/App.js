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

import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './themes.js';

const BAD_INPUT_MSG = 'Empty Display Name or Color Num not a number';
const WAIT_STR = 'Please Wait...';

function App() {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  let user_id = '';

  const displayNameTextbox = React.createRef();
  const colorNumTextbox = React.createRef();

  const validateInput = () => {
    var disp_name_val = displayNameTextbox.current.value;
    var color_num_val = colorNumTextbox.current.value;
    if (color_num_val.trim() === '' || isNaN(color_num_val) || disp_name_val.trim() === '') {
      return false;
    }
    return true;
  };

  const handleLoginClick = async () => {
    if (!validateInput()) {
      setUserMsg(BAD_INPUT_MSG);
      return;
    }
    setUserMsg(WAIT_STR);

    try {
      const response = await axios.post('/register', { display_name: displayNameTextbox.current.value, 
        number_of_colors_in_clothes: colorNumTextbox.current.value});
      handleLoginResponse(response);
    } catch (error) {
      handleLoginError(error);
    }
  };

  const handleLoginError = (reason) => {
    setUserMsg('Connection Error: ' + reason);
  };

  const handleLoginResponse = (response) => {
    user_id = response.data.id;
    setLoginSuccess(true);
  };
  
  if (loginSuccess) {
    return (
      <UserIdContext.Provider value={user_id}>
        <div className='main__container'>
          <Options/>
        </div>
      </UserIdContext.Provider>
    );
  }
  else {
    return (
      <div className='main__container'>
        Display Name: <input type="text" ref={displayNameTextbox} /><br/>
        How many colors are you wearing: <input type="text" ref={colorNumTextbox} /><br/><br/>
        <button className='button' onClick={handleLoginClick}>Lets Start!</button>
        <p>{userMsg}</p>
      </div>
    );
  }
}

export default App;
