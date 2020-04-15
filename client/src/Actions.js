import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';
import { AppBar, Toolbar, Typography, Button, IconButton, TextField, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Hidden, Paper } from '@material-ui/core';

function InformPlayerOptions(props) {
  const {onClose, showPopup, reportSelection, playerDisplayName, highlightArray} = props;

  let informationOptions = [1, 2, 3, 4, 5, 'red', 'green', 'blue', 'yellow', 'white'];

  const renderPopUp = () => {
    let tempHighlightArray = highlightArray; // so we can change it in case of rainbow
    if (tempHighlightArray.includes('rainbow')) {
      tempHighlightArray = tempHighlightArray.concat(informationOptions.filter((value) => {return isNaN(value);}));
    }
    return(
      <Dialog open={showPopup} onClose={onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          Inform {playerDisplayName} about:
        </DialogTitle>
        <DialogContent>
          {informationOptions.filter(((value) => {return !isNaN(value);})).map((value) => <Button key={'btn_' + value} onClick={() => reportSelection(value)}
            style={{background: tempHighlightArray.includes(value) ? 'yellow' : 'white'}} variant='outlined'
            size='small'>{value}</Button>)}
          <br/>
          {informationOptions.filter(((value) => {return isNaN(value);})).map((value) => <Button key={'btn_' + value} onClick={() => reportSelection(value)}
            style={{background: tempHighlightArray.includes(value) ? 'yellow' : 'white'}} variant='outlined'
            size='small'>{value}</Button>)}
        </DialogContent>

        <DialogActions>
          <Button key='close' onClick={onClose} color="primary">
            Do nothing!
          </Button>
          <Button key='close' onClick={onClose} color="primary">
            Think!
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return renderPopUp();
}

/*
      <Popup onClose={onClose} open={showPopup}>
        <h1> Inform {playerDisplayName} about: </h1>
        {informationOptions.map((value) => <button key={'btn_' + value} onClick={() => reportSelection(value)}
          style={{background: tempHighlightArray.includes(value) ? 'yellow' : 'white'}}>{value}</button>)}
        <br/><br/>
        <button key='close' onClick={onClose}>Do nothing!</button><button key='think' onClick={onClose}>Think!</button>
      </Popup>

*/
InformPlayerOptions.propTypes = {
  onClose: PropTypes.func.isRequired,
  showPopup: PropTypes.bool.isRequired,
  reportSelection: PropTypes.func.isRequired,
  playerDisplayName: PropTypes.string.isRequired,
  highlightArray: PropTypes.array,
};

export default InformPlayerOptions;