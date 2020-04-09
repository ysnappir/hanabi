import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
function InformPlayerOptions(props) {
  const {onClose, showPopup, reportSelection, playerDisplayName, highlightArray} = props;

  let informationOptions = [1, 2, 3, 4, 5, 'red', 'green', 'blue', 'yellow', 'white', 'rainbow'];

  const renderPopUp = () => {
    return(
      <Popup trigger={<div></div>} onClose={onClose} open={showPopup}>
        <h1> Inform {playerDisplayName} about: </h1>
        {informationOptions.map((value) => <button key={value} onClick={() => reportSelection(value)}
          style={{background: highlightArray.includes(value) ? 'yellow' : 'white'}}>{value}</button>)}
        <br/><br/>
        <button onClick={onClose}>Do nothing!</button><button onClick={onClose}>Think!</button>
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