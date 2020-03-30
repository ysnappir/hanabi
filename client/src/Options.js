import React, {useState, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import GamePlay from './GamePlay';
import {UserIdContext} from './Contex.js';

function JoinGame(props) {
  const {onJoinGame} = props;
  const userId = useContext(UserIdContext);
  const [showPinField, setShowPinField] = useState(false);
  const pinCode = React.createRef();

  const handleJoinGameResponse = (response) => {
    console.log(response);
    const pin = pinCode.current.value;
    onJoinGame(pin);
  };

  const handleJoinGameError = (reason) =>  {
    // TODO
    console.log(reason);
  };

  const handleJoinClick = async () => {
    const pin = pinCode.current.value;    
    console.log(pin);

    try {
      const response = await axios.post( `/join_game/${userId}/${pin}`, {});
      handleJoinGameResponse(response);
    } catch (error) {
      handleJoinGameError(error);
    }
  };

  return (
    <>
      <div>
        <button className='button' onClick={() => setShowPinField(!showPinField)}>
          {showPinField ? 'Don\'t Join Game': 'Join Game'}
        </button>
      </div>

      {showPinField && 
      <div>
          PIN code:
        <input type="text" ref={pinCode}/>
        <button className='button' onClick={handleJoinClick}>Join!</button> <br/>
      </div>}
    </>
  );

}

JoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
};


function CreateGame(props) {

  const {onCreateGame, onJoinGame} = props;
  
  const userId = useContext(UserIdContext);

  const handleCreateGameResponse = (response) => {
    console.log(response);
    let pin = response.data.game_id;
    onCreateGame();
    onJoinGame(pin);
  };

  const handleCreateClick = async () => {   
    try {
      const response = await axios.post( `/create_game/${userId}`, {});
      handleCreateGameResponse(response);
    } catch (error) {
      //TODO: handle create game error;
      console.log('Create game has thrown and exception');
    }
  };

  return (
    <div>
      <button className='button' onClick={() => handleCreateClick()}>Create Game!</button>
    </div>
  );

}

CreateGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func,
};

function Options() {
  
  // const userId = useContext(UserIdContext);
  // const gameId = useContext(GameIdContext);
  const [pinCode, setPinCode] = useState(-1);
 
  const onJoinGame = (NewPinCode) => {
    setPinCode(String(NewPinCode));
  };

  if (pinCode > 0){
    return (
      <div className='main__container'>
        <GamePlay gameId={pinCode} />
      </div>
    );
  }
  else{
    return (
      <div className='main__container'>
        What Do You Want To Do? <br/> <br/>
        <CreateGame onJoinGame={onJoinGame} onCreateGame={() => {}} />
        <JoinGame onJoinGame={onJoinGame} />
      </div>
    );
  }
}

export default Options;
