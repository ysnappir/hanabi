import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';

function InformPlayerOptions(props) {
  const {onClose, showPopup, reportSelection, playerDisplayName, highlightArray} = props;

  let informationOptions = [1, 2, 3, 4, 5, 'red', 'green', 'blue', 'yellow', 'white'];

  const renderPopUp = () => {
    return(
      <Popup onClose={onClose} open={showPopup}>
        <h1> Inform {playerDisplayName} about: </h1>
        {informationOptions.map((value) => <button key={'btn_' + value} onClick={() => reportSelection(value)}
          style={{background: highlightArray.includes(value) ? 'yellow' : 'white'}}>{value}</button>)}
        <br/><br/>
        <button key='close' onClick={onClose}>Do nothing!</button><button key='think' onClick={onClose}>Think!</button>
      </Popup>
    );
  };

  return renderPopUp();
}

InformPlayerOptions.propTypes = {
  onClose: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  reportSelection: PropTypes.func.isRequired,
  playerDisplayName: PropTypes.string.isRequired,
  highlightArray: PropTypes.array,
};

export default InformPlayerOptions;