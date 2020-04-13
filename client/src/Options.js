import React, {useState, useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

import { Card, CardActionArea, CardActions, CardContent, CardMedia, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
  button: {
    width: 200,
  },
  media: {
    height: 140,
  },
});

  
function JoinGame(props) {
  const classes = useStyles();

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
        <Button className={classes.button} variant="contained" color="primary" margin="normal" onClick={() => setShowPinField(!showPinField)}>
          {showPinField ? 'Don\'t Join Game': 'Join Game'}
        </Button>
      </div>

      {showPinField && 
      <div>
          PIN code:
        <input type="text" ref={pinCode}/>
        <Button className={classes.button} variant="contained" color="secondary" margin="normal" onClick={handleJoinClick}>
          Join!
        </Button>
      </div>}
    </>
  );

}

JoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
};


function CreateGame(props) {
  const classes = useStyles();
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
      console.log('Create game has thrown an exception');
    }
  };

  return (
    <div>
      <Button className={classes.button} variant="contained" color="primary" margin="normal" onClick={() => handleCreateClick()}>
        Create Game!
      </Button>
    </div>
  );

}

CreateGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func,
};

function Options(props) {  
  const {onDisplayGame} = props;
  const classes = useStyles();

 
  const onJoinGame = (NewPinCode) => {
    onDisplayGame(String(NewPinCode));
  };

  return (
    <div className='main__container'>
      <Typography variant="h4" component="h2">
                What Do You Want To Do?
      </Typography>
      <CreateGame onJoinGame={onJoinGame} onCreateGame={() => {}} />
      <JoinGame onJoinGame={onJoinGame} />
    </div>
  );
}

Options.propTypes = {
  onDisplayGame: PropTypes.func.isRequired,
};


export default Options;
