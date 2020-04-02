import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './Contex.js';
import GamePlay from './GamePlay';

const BAD_INPUT_MSG = 'Empty Display Name or Color Num not a number';
const WAIT_STR = 'Please Wait...';

function App() {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userMsg, setUserMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [pinCode, setPinCode] = useState(undefined);

  const displayNameTextbox = React.createRef();
  const colorNumTextbox = React.createRef();

  const validateInput = () => {
    const dispNameVal = displayNameTextbox.current.value;
    const colorNumVal = colorNumTextbox.current.value;
    if (colorNumVal.trim() === '' || isNaN(colorNumVal) || dispNameVal.trim() === '') {
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
    setUserId(response.data.id);
    setLoginSuccess(true);
  };

  const onDisplayGame = (pinCode) => {
    setPinCode(pinCode);
  };

  if (loginSuccess || pinCode) {
    return (
      <UserIdContext.Provider value={userId}>
        <div>
          { pinCode ? <GamePlay gameId={pinCode} /> : <Options onDisplayGame={onDisplayGame}/> }
        </div>
      </UserIdContext.Provider>
    );
  }

  return (
    <div className='main__container'>
        Display Name: <input type="text" ref={displayNameTextbox} /><br/>
        How many colors are you wearing: <input type="text" ref={colorNumTextbox} /><br/><br/>
      <button className='button' onClick={handleLoginClick}>Lets Start!</button>
      <p>{userMsg}</p>
    </div>
  );
}

export default App;
