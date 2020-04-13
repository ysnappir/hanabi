import React, { useState, Fragment } from 'react';
import './App.css';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './Contex.js';
import GamePlay from './GamePlay';

import { AppBar, Toolbar, Typography, Button, IconButton, TextField, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Hidden, Paper } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function App() {
  const [startLogin, setStartLogin] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [pinCode, setPinCode] = useState(undefined);

  const [fetchingData, setFetchingData] = useState(false);
  const [loginData, setLoginData] = useState({displayName : '', numOfColors : undefined});
  const [loginErrors, setLoginErrors] = useState({displayName : '', numOfColors : ''});
  
  const classes = useStyles();

  const validateInput = () => {
    const dispNameVal = loginData['displayName'];
    const colorNumVal = loginData['numOfColors'];
    let isError = false;

    if (colorNumVal.trim() === '') {
      setLoginErrors(prev => ({ 
        ...prev,
        ['numOfColors']: 'Num Of Colors Is Required!'
      }));
      isError = true;
    }
    else if (colorNumVal <= 0) {
      setLoginErrors(prev => ({ 
        ...prev,
        ['numOfColors']: 'Num Of Colors Must Be Positive!'
      }));
      isError = true;
    }
    
    if (dispNameVal.trim().length <= 1) {
      setLoginErrors(prev => ({ 
        ...prev,
        ['displayName']: 'Display Name Must Be Longer Than 1 Char!'
      }));
      isError = true;
    }

    return !isError;
  };


  const changeLoginData = (event) => {
    let { id, value } = event.target;

    setLoginData(prev => ({ 
      ...prev,
      [id]: value
    }));
  };


  const handleLoginClick = async () => {
    if (!validateInput()) {
      return;
    }

    try {
      setFetchingData(true);
      const response = await axios.post('/register', { display_name: loginData['displayName'], 
        number_of_colors_in_clothes: loginData['numOfColors']});
      handleLoginResponse(response);
      setFetchingData(false);
    } catch (error) {
      handleLoginError(error);
      setFetchingData(false);
    }
  };

  const handleLoginError = (reason) => {
    // TODO: handle login error
  };

  const handleLoginResponse = (response) => {
    setUserId(response.data.id);
    setLoginSuccess(true);
  };

  const onDisplayGame = (pinCode) => {
    setPinCode(pinCode);
  };

  return (
    <Fragment>
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title} align='center'>
              Hanabi Online!
            </Typography>
            {loginSuccess ? 
              <Typography variant="subtitle1" className={classes.title} align='right'>
                {loginData['displayName']}
              </Typography>
              :
              <div/>
            }
            <IconButton 
              color="inherit"
              onClick={() => setStartLogin(true)}>
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>

      { (loginSuccess || pinCode) ?
        <UserIdContext.Provider value={userId}>
          <div>
            { pinCode ? <GamePlay gameId={pinCode} /> : <Options onDisplayGame={onDisplayGame}/> }
          </div>
        </UserIdContext.Provider>

        :

        <Fragment>
          <div>
            <img src={require ('./img/game_box.png')} style={{ alignItems: 'center', justifyContent:'center'}}/>
          </div>

          <Dialog open={startLogin} onClose={() => setStartLogin(false)} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
          Login!
            </DialogTitle>
            <DialogContent>
              <form>
                <DialogContentText>
          Let go. Tell us your display name and how many colors you are wearing.
                </DialogContentText>
                <TextField
                  autoFocus
                  required
                  margin="normal"
                  id="displayName"
                  label="Display Name"
                  type="string"
                  fullWidth
                  onChange={(event) => changeLoginData(event)}
                  error={loginErrors['displayName']}
                  helperText={loginErrors['displayName']}
                />
                <TextField
                  required
                  autoComplete="off"
                  margin="normal"
                  id="numOfColors"
                  label="Number Of Colors"
                  type="number"
                  fullWidth
                  onChange={(event) => changeLoginData(event)}
                  error={loginErrors['numOfColors']}
                  helperText={loginErrors['numOfColors']}

                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStartLogin(false)} color="primary">
          Cancel
              </Button>
              <Button type='submit' onClick={handleLoginClick} color="primary">
          Subscribe
              </Button>
            </DialogActions>
      
          </Dialog>
        </Fragment>
      }
    </Fragment>
  );
}

export default App;
