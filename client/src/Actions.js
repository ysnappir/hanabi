import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

function ActionsPopup(props) {
  const {showPopup, setShowPopup, cardIndex} = props;
  const userId = useContext(UserIdContext);

  return (
    <Popup trigger={<div></div>} onClose={() => setShowPopup(false)} open={showPopup} modal>
      <h1> Pressed card number {cardIndex} </h1>
      <h3> What would you want to do? </h3>
      <Action buttonDisplay='Burn It!' userId={+userId} actionFunc={burnActionFunc} funcData={cardIndex}/>
      <button onClick={()=> {setShowPopup(false);}}>Do nothing!</button>
    </Popup>
  );
}

ActionsPopup.propTypes = {
  setShowPopup: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  cardIndex: PropTypes.number.isRequired,
};


async function burnActionFunc(userId, cardIndex) {
  try {
    const response = await axios.post('/make_turn/burn/' + {userId}, {'card_index': {cardIndex}});
  }
  catch(error) {
    console.log('Error burning card');
  }
  
}

function Action(props) {
  const {buttonDisplay, actionFunc, funcData, userId} = props;

  
  return (
    <div>
      <button onClick={actionFunc(userId, funcData)}>{buttonDisplay}</button>
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