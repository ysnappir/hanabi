import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';

function ActionsPopup(props) {
  const {showPopup, setShowPopup, cardIndex} = props;

  return (
    <Popup trigger={<div></div>} onClose={() => setShowPopup(false)} open={showPopup} modal>
      <h1>Pressed card number {cardIndex}</h1>
      <button onClick={()=> {setShowPopup(false);}}>Do nothing!</button>
    </Popup>
  );
}

ActionsPopup.propTypes = {
  setShowPopup: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  cardIndex: PropTypes.number.isRequired,
};
  

export default ActionsPopup;