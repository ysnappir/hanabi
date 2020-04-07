import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

function ActionsPopup(props) {
  const {showPopup, setShowPopup, cardIndex, activePlayer} = props;
  const userId = useContext(UserIdContext);

  let isActivePlayer = (activePlayer == userId);

  return (
    <Popup trigger={<div></div>} onClose={() => setShowPopup(false)} open={showPopup} modal>
      <h1> Pressed card number {cardIndex} </h1>
      {isActivePlayer ?
        <SelfCardActions cardIndex={cardIndex}/>
        :
        <h3> Not your turn, Dumbass! </h3>
      }
      <button onClick={()=> {setShowPopup(false);}}>Do nothing!</button>
    </Popup>
  );
}

ActionsPopup.propTypes = {
  setShowPopup: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  cardIndex: PropTypes.number.isRequired,
  activePlayer: PropTypes.number.isRequired,
  playerId: PropTypes.number.isRequired,
};


function SelfCardActions(props) {
  const userId = useContext(UserIdContext);
  const {cardIndex} = props;

  return (
    <div>
      <h3> What would you want to do? </h3>
      <Action buttonDisplay='Burn It!' userId={+userId} actionFunc={burnActionFunc} funcData={cardIndex}/> 
      <Action buttonDisplay='Place It!' userId={+userId} actionFunc={placeActionFunc} funcData={cardIndex}/> 
    </div>
  );
}

SelfCardActions.propTypes = {
  cardIndex: PropTypes.number.isRequired,
};
  

async function burnActionFunc(userId, cardIndex) {
  try {
    const response = await axios.post('/make_turn/burn/' + userId, {'card_index': cardIndex});
  }
  catch(error) {
    console.log('Error burning card ' + error);
  }
}

async function placeActionFunc(userId, cardIndex) {
  try {
    const response = await axios.post('/make_turn/place/' + userId, {'card_index': cardIndex});
  }
  catch(error) {
    console.log('Error placing card ' + error);
  }
}

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