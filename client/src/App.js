import React, { useState, Fragment } from 'react';
import './App.css';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './Contex.js';
import GamePlay from './GamePlay';

import { AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';
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

  const handleLoginClick = async () => {
    if (!validateInput()) {
      setUserMsg(BAD_INPUT_MSG);
      return;
    }
    setUserMsg(WAIT_STR);

    try {
      const response = await axios.post('/register', { display_name: displayNameTextbox.current.value, 
        number_of_colors_in_clothes: colorNumTextbox.current.value});
      handleLoginResponse(response);
    } catch (error) {
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
    </Fragment>
  );
}
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
