import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

function ActionsPopup(props) {
  const {showPopup, onCloseFunc, cardIndex, activePlayer, playerId} = props;
  const userId = useContext(UserIdContext);

  let isActivePlayer = (activePlayer == userId);

  let headerMsg = '';
  if (cardIndex >= 0) {
    headerMsg = 'Pressed card number' + cardIndex;
  }
  else if (playerId >= 0) {
    headerMsg = 'Pressed Player ID' + playerId;
  }
  else {
    headerMsg = 'What just happened?';
  }

  return (
    <Popup trigger={<div></div>} onClose={onCloseFunc} open={showPopup} modal>
      <h1> {headerMsg} </h1>
      {isActivePlayer ?
        <ActionPossibilities cardIndex={cardIndex} playerId={playerId}/>
        :
        <h3> Not your turn, Dumbass! </h3>
      }
      <button onClick={onCloseFunc}>Do nothing!</button>
    </Popup>
  );
}

ActionsPopup.propTypes = {
  onCloseFunc: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  cardIndex: PropTypes.number.isRequired,
  activePlayer: PropTypes.number.isRequired,
  playerId: PropTypes.number.isRequired,
};


function ActionPossibilities(props) {
  const {cardIndex, playerId} = props;

  return (
    <div>
      {cardIndex >= 0 ?
        <SelfCardActions cardIndex={cardIndex}/>:
        <DifferentPlayerActions playerId={playerId}/>
      }
    </div>
  );
}

ActionPossibilities.propTypes = {
  cardIndex: PropTypes.number.isRequired,
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


function DifferentPlayerActions(props) {
  const userId = useContext(UserIdContext);
  const {playerId} = props;

  return (
    <div>
          Want to inform him, eh?
    </div>
  );
}

DifferentPlayerActions.propTypes = {
  playerId: PropTypes.number.isRequired,
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