import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FullTokenPile from './Tokens.js';
import Player, {OwnHand} from './Player.js';
import {UserIdContext} from './Contex.js';
import {MAX_CLUE_TOKENS, MAX_MISS_TOKENS} from './Tokens.js';
import RemainingDeck, {HanabiTable, BurntPile} from './CardPiles.js';
import {CARD_WIDTH} from './Cards.js';
import InformPlayerOptions from './Actions';

import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography } from '@material-ui/core';

const TEST_JSON = {
  'active_player_id': '31', 
  'blue_tokens': 8, 
  'burnt_pile': [], 
  'deck_size': 45, 
  'hands': [
    {
      'cards': [
        {
          'color': null, 
          'flipped': false, 
          'is_informed': false, 
          'number': null
        }, 
        {
          'color': null, 
          'flipped': false, 
          'is_informed': false, 
          'number': null
        }, 
        {
          'color': null, 
          'flipped': false, 
          'is_informed': false, 
          'number': null
        }, 
        {
          'color': null, 
          'flipped': false, 
          'is_informed': false, 
          'number': null
        }, 
        {
          'color': null, 
          'flipped': false, 
          'is_informed': false, 
          'number': null
        }
      ], 
      'display_name': 'sdl;fk', 
      'id': '32'
    }, 
    {
      'cards': [
        {
          'color': 'yellow', 
          'flipped': false, 
          'is_informed': false, 
          'number': 4
        }, 
        {
          'color': 'rainbow', 
          'flipped': false, 
          'is_informed': false, 
          'number': 4
        }, 
        {
          'color': 'white', 
          'flipped': false, 
          'is_informed': false, 
          'number': 4
        }, 
        {
          'color': 'yellow', 
          'flipped': false, 
          'is_informed': false, 
          'number': 1
        }, 
        {
          'color': 'green', 
          'flipped': false, 
          'is_informed': false, 
          'number': 1
        }
      ], 
      'display_name': 'asdf', 
      'id': '31'
    }
  ], 
  'last_action': null, 
  'red_tokens': 3, 
  'status': 'active', 
  'table': {
    'blue': 0, 
    'green': 0, 
    'rainbow': 0, 
    'red': 0, 
    'white': 0, 
    'yellow': 0
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));



function WaitForGameStart(props) {
  const {gameId, currPlayers } = props;

  const onStartGameClick = async () => {
    try {
      const response = await axios.post('/start_game/' + gameId, {});
      handleStartGameResponse(response);
    }
    catch(error) {
      handleStartGameError(error);
    }
  };

  const handleStartGameResponse = (response) => {
    console.log(response);
  };

  const handleStartGameError = (reason) => {
    console.log(reason);
  };

  return (
    <div>
      <h1>Welcome to Game Number {gameId}</h1>
      <h2>The game hasn&apos;t started yet. Current players are:</h2>
      { currPlayers.length > 0 && 
        <ul>
          {currPlayers.map((player, index) => <li key={index}>{player['display_name']}</li>)}
        </ul>
      }
      <button onClick={onStartGameClick}>Start Game</button>
    </div>
  );
}

WaitForGameStart.propTypes = {
  gameId: PropTypes.string.isRequired,
  currPlayers: PropTypes.array.isRequired,
};


const getPlayerCards = (players, id) => {
  const relevantPlayers = players.filter(player => player['id'] === id);
  return relevantPlayers.length ? relevantPlayers[0]['cards'] : [];
};


function HanabiBoard(props) {
  const classes = useStyles();

  const {gameId, players, clueTokens, missTokens, remainingDeckSize, hanabiTable, activePlayer, burntPileCards, lastAction} = props;

  const userId = useContext(UserIdContext);

  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(undefined);
  const [playerPressedId, setPlayerPressedId] = useState(undefined);
  const [indexPressedId, setIndexPressedId] = useState(undefined);
  
  const onActionPopupClose = () => {
    setShowActionsPopup(false);
    setPlayerPressedId(undefined);
    setIndexPressedId(undefined);
  };

  const getInfromReporter = (userId, informedUserId) => {
    const sendInform = (value) => {
      console.log('Informing ' + informedUserId + ' about ' + value + '!');
      axios.post( `/make_turn/inform/${userId}`, {'informed_player_id': informedUserId, 'information': value});
      onActionPopupClose();
    };
    return sendInform;
  };

  const informCard = (playerId) => {
    const inner = (cardIndex) => {
      console.log('clicked card ' + cardIndex + ' of player ' + playerId);
      if (userId === activePlayer){
        setPlayerPressedId(playerId);
        setIndexPressedId(cardIndex);
        setShowActionsPopup(true);
      }
    };
    return inner;
  };

  const getPlayerDisplayName = () => {
    if (!playerPressedId){
      return '';
    }

    return players.filter((value) => value['id'] === playerPressedId)[0]['display_name'];
  };

  const getCardPressedInfo = () => {
    if(indexPressedId === undefined){
      return [];
    }
    const card = getPlayerCards(players, playerPressedId)[indexPressedId];
    return [card['color'], card['number']];
  };

  informCard.propTypes = {
    playerId: PropTypes.string.isRequired,
  };

  return (
    <div>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h3">
                Full game play - game number {gameId}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <HanabiTable table={hanabiTable} droppedCardIndex={draggedIndex} isMyTurn={userId === activePlayer}/>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <BurntPile cardList={burntPileCards} droppedCardIndex={draggedIndex} isMyTurn={userId === activePlayer}/>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <FullTokenPile clueTokens={+clueTokens} missTokens={+missTokens}/> <br/><br/>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <RemainingDeck remainingCards={remainingDeckSize}/>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <InformPlayerOptions 
                onClose={onActionPopupClose} 
                showPopup={showActionsPopup} 
                reportSelection={getInfromReporter(userId, playerPressedId)} 
                playerDisplayName={getPlayerDisplayName()} 
                highlightArray={getCardPressedInfo()}
                key={'informPopUp'}
              />
              <PlayersHands
                players={players}
                activePlayer={activePlayer}
                draggedIndex={draggedIndex}
                onDraggedIndex={setDraggedIndex}
                onInformCard={informCard}
                lastAction={lastAction}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>

  );
}

HanabiBoard.propTypes = {
  gameId: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
  clueTokens: PropTypes.number.isRequired,
  missTokens: PropTypes.number.isRequired,
  remainingDeckSize: PropTypes.number.isRequired,
  hanabiTable: PropTypes.object.isRequired,
  activePlayer: PropTypes.string.isRequired,
  burntPileCards: PropTypes.array.isRequired,
  lastAction: PropTypes.object,
};


function PlayersHands(props) {
  const {players, activePlayer, draggedIndex, onDraggedIndex, onInformCard, lastAction} = props;

  const divWidth = (getPlayerCards(players, players[0]['id']).length + 0.25) * (CARD_WIDTH + 10); // the width of a card. Not sure why I need the 0.25

  return (
    <>
      {players.map((player, index) => 
        <div 
          key={'player_div+' + player['id']}
          style={{width: divWidth + 'px', border: player['id'] === activePlayer ? '2px solid red' : 'none'}}
        >
          {lastAction && player['id'] === lastAction['informed_player'] &&
            <span><font color="blue">Be informed about: {lastAction['information_data']}</font></span>
          }
          {index === 0 ?
            <OwnHand 
              cards={getPlayerCards(players, player['id'])} 
              setDraggedIndex={onDraggedIndex} 
              draggedIndex={draggedIndex}/>
            :
            <Player
              userId={player['id']}
              displayName={player['display_name']} 
              cards={getPlayerCards(players, player['id'])}
              onClick={onInformCard(player['id'])}/>
          }
        </div>
      )}
    </>
  );
}

PlayersHands.propTypes = {
  players: PropTypes.array.isRequired,
  activePlayer: PropTypes.string.isRequired,
  draggedIndex: PropTypes.number,
  onDraggedIndex: PropTypes.func.isRequired,
  onInformCard: PropTypes.func.isRequired,
  lastAction: PropTypes.object,
};

function GamePlay(props) {
  const userId = useContext(UserIdContext);
  const {gameId} = props;
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [availableClueTokens, setAvailableClueTokens] = useState(MAX_CLUE_TOKENS);
  const [availableMissTokens, setAvailableMissTokens] = useState(MAX_MISS_TOKENS);
  const [remainingDeckSize, setRemainingDeckSize] = useState(-1);
  const [hanabiTable, setHanabiTable] = useState([]);
  const [activePlayer, setActivePlayer] = useState(-1);
  const [burntPileCards, setBurntPileCards] = useState([]);
  const [lastAction, setLastAction] = useState(undefined);

  const updateGameState = async () => {
    try {
      const response = await axios.get('/game_state/' + userId + '/' + gameId, {});
      //const response = '';
      handleGetGameStateResponse(response);
    } catch (error) {
      handleGetGameStateError(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => { updateGameState(); }, 1000);
    return () => clearInterval(interval);}
  );

  const handleGetGameStateResponse = (response) => {
    let myJson = response.data;
    //let myJson = TEST_JSON;
    console.log(myJson);
    setAvailableClueTokens(myJson['blue_tokens']);
    setAvailableMissTokens(myJson['red_tokens']);

    setPlayers(myJson['hands']);

    setRemainingDeckSize(myJson['deck_size']);
    setHanabiTable(myJson['table']);
    setActivePlayer(myJson['active_player_id']);
    setBurntPileCards(myJson['burnt_pile']);
    setLastAction(myJson['last_action']);

    if (!isGameStarted) {
      if (myJson['hands'].length > 0 && myJson['hands'][0].cards.length > 0) {
        console.log('Game Started!');
        setIsGameStarted(true);
      }
    }
  };

  const handleGetGameStateError = (reason) => {
    console.log(reason);
  };

  return (
    <>
      { !isGameStarted ? 
        <WaitForGameStart gameId={gameId} currPlayers={players}/> 
        :
        <HanabiBoard
          gameId={gameId}
          players={players}
          clueTokens={+availableClueTokens}
          missTokens={+availableMissTokens}
          remainingDeckSize={remainingDeckSize}
          hanabiTable={hanabiTable}
          burntPileCards={burntPileCards}
          activePlayer={activePlayer}
          lastAction={lastAction}
        />
      }
    </>
  );
}

GamePlay.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default GamePlay;