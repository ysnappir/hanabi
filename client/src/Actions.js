import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

function ActionsPopup(props) {
  const {showPopup, onCloseFunc, cardIndex, playerId} = props;

  let headerMsg = '';
  
  headerMsg = 'Pressed Player: ' + playerId;
  
  return (
    <Popup trigger={<div></div>} onClose={onCloseFunc} open={showPopup}>
      <h1> {headerMsg} </h1>
      <DifferentPlayerActions playerId={playerId} onClose={onCloseFunc}/>
      <button onClick={onCloseFunc}>Do nothing!</button>
    </Popup>
  );
}

ActionsPopup.propTypes = {
  onCloseFunc: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  cardIndex: PropTypes.number.isRequired,
  playerId: PropTypes.string.isRequired,
};

function DifferentPlayerActions(props) {
  const userId = useContext(UserIdContext);
  const {playerId, onClose} = props;

  let informationOptions = [1, 2, 3, 4, 5, 'red', 'green', 'blue', 'yellow', 'white'];

  const sendInform = (value) => {
    console.log('Informing ' + playerId + ' about ' + value + '!');
    // console.log(typeof playerId);
    axios.post( `/make_turn/inform/${userId}`, {'informed_player_id': playerId, 'information': value});
    onClose();
  };

  return (
    <div>
      {informationOptions.map((value) => <button key={value} onClick={() => sendInform(value)}>{value}</button>)}
    </div>
  );
}

DifferentPlayerActions.propTypes = {
  playerId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

function Action(props) {
  const {buttonDisplay, actionFunc, funcData, userId} = props;

  return (
    <div>
      <button onClick={() => actionFunc(userId, funcData)}>{buttonDisplay}</button>
    </div>
  );
}

Action.propTypes = {
  buttonDisplay: PropTypes.string.isRequired,
  actionFunc: PropTypes.func.isRequired,
  funcData: PropTypes.any.isRequired,
  userId: PropTypes.number.isRequired,
};
  

export default ActionsPopup;