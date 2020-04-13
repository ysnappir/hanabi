import React, { useState, Fragment } from 'react';
import './App.css';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './Contex.js';
import GamePlay from './GamePlay';

import { AppBar, Toolbar, Typography, Button, IconButton, TextField, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormHelperText, CircularProgress } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { makeStyles } from '@material-ui/core/styles';



const BAD_INPUT_MSG = 'Empty Display Name or Color Num not a number';
const WAIT_STR = 'Please Wait...';

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
  const [userMsg, setUserMsg] = useState('');
  
  const [userId, setUserId] = useState('');
  const [pinCode, setPinCode] = useState(undefined);

  const [fetchingData, setFetchingData] = useState(false);
  const [loginData, setLoginData] = useState({displayName : '', numOfColors : undefined});

  const displayNameTextbox = React.createRef();
  const colorNumTextbox = React.createRef();

  const classes = useStyles();

  const validateInput = () => {
    const dispNameVal = displayNameTextbox.current.value;
    const colorNumVal = colorNumTextbox.current.value;
    if (colorNumVal.trim() === '' || isNaN(colorNumVal) || dispNameVal.trim() === '') {
      return false;
    }
    return true;
  };


  const changeLoginData = (event) => {
    let { id, value } = event.target;

    setLoginData(prev => ({ 
      ...prev,
      [id]: value
    }));
  };


  const handleLoginClick = async () => {
    console.log(loginData);
    /*
    if (!validateInput()) {
      setUserMsg(BAD_INPUT_MSG);
      return;
    }
    setUserMsg(WAIT_STR);
    */
    // TODO: validate
    try {
      /*
      const response = await axios.post('/register', { display_name: displayNameTextbox.current.value, 
        number_of_colors_in_clothes: colorNumTextbox.current.value});
        */
      setFetchingData(true);
      const response = await axios.post('/register', { display_name: loginData['displayName'], 
        number_of_colors_in_clothes: loginData['numOfColors']});
      handleLoginResponse(response);
      setFetchingData(false);
    } catch (error) {
      setFetchingData(false);
      handleLoginError(error);
    }
  };

  const handleLoginError = (reason) => {
    setUserMsg('Connection Error: ' + reason);
  };

  const handleLoginResponse = (response) => {
    setUserId(response.data.id);
    setLoginSuccess(true);
  };

  const onDisplayGame = (pinCode) => {
    setPinCode(pinCode);
  };

  if (loginSuccess || pinCode) {
    return (
      <UserIdContext.Provider value={userId}>
        <div>
          { pinCode ? <GamePlay gameId={pinCode} /> : <Options onDisplayGame={onDisplayGame}/> }
        </div>
      </UserIdContext.Provider>
    );
  }

  return (
    <Fragment>
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title} align='center'>
              Hanabi Online!
            </Typography>
            <IconButton 
              color="inherit"
              onClick={() => setStartLogin(true)}>
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>

      <div>
        <img src={require ('./img/game_box.png')} style={{ alignItems: 'center', justifyContent:'center'}}/>
      </div>
      {fetchingData ? <CircularProgress /> : <div/> }
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
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartLogin(false)} color="primary">
            Cancel
          </Button>
          <Button type='submit' onClick={() => {handleLoginClick(); setStartLogin(false);}} color="primary">
            Subscribe
          </Button>
        </DialogActions>
        
      </Dialog>
    </Fragment>
  );
}

/*
          This dialog spans the entire width of the screen.
          <TextField name="email" hintText="Email" />
          <TextField name="pwd" type="password" hintText="Password" />
          <div style={{ textAlign: 'right', padding: 8, margin: '24px -24px -24px -24px' }}>
            {actions}
          </div>
*/

/*
      {startLogin ? 
        <div className='main__container'>
        Display Name: <input type="text" ref={displayNameTextbox} /><br/>
        How many colors are you wearing: <input type="text" ref={colorNumTextbox} /><br/><br/>
          <button className='button' onClick={handleLoginClick}>Lets Start!</button>
          <p>{userMsg}</p>
        </div>
        :
        <div/>
      }

*/


/*
import React from 'react';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open form dialog
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

*/





/*
{auth && (
  <div>
    <IconButton
      aria-label="account of current user"
      aria-controls="menu-appbar"
      aria-haspopup="true"
      onClick={handleMenu}
      color="inherit"
    >
      <AccountCircle />
    </IconButton>
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={open}
      onClose={handleClose}
    >
      <MenuItem onClick={handleClose}>Profile</MenuItem>
      <MenuItem onClick={handleClose}>My account</MenuItem>
    </Menu>
  </div>
)}
*/



/*
export default function ButtonAppBar() {
  

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
*/

export default App;
