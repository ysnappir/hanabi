/*eslint linebreak-style: ["error", "unix"]*/

import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FullTokenPile from './Tokens.js';
import Player, {OwnHand} from './Player.js';
import {UserIdContext} from './Contex.js';
import {MAX_CLUE_TOKENS, MAX_MISS_TOKENS} from './Tokens.js';
import RemainingDeck, {HanabiTable, BurntPile} from './CardPiles.js';
import {CARD_WIDTH, CARD_HEIGHT} from './Cards.js';
import InformPlayerOptions from './Actions';
import tubinModes from './Enums';

import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography } from '@material-ui/core';

// a game status json - for tests...
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


let colorByResult = {
  'ongoing': 'white',
  'won': 'green',
  'lost': 'black',
  'unwinable': 'red',
  'unwinable_by_deck': 'orange',
};


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

  const {handleGetGameStateResponse, gameId, players, clueTokens, missTokens, remainingDeckSize, hanabiTable, activePlayer, burntPileCards, lastAction, stateTimestamp} = props;

  const userId = useContext(UserIdContext);

  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(undefined);
  const [playerPressedId, setPlayerPressedId] = useState(undefined);
  const [indexPressedId, setIndexPressedId] = useState(undefined);
  const [tubinMode, settubinMode] = useState(0);
  
  const onActionPopupClose = () => {
    setShowActionsPopup(false);
    setPlayerPressedId(undefined);
    setIndexPressedId(undefined);
  };

  const getInfromReporter = (userId, informedUserId) => {
    async function sendInform(value){
      console.log('Informing ' + informedUserId + ' about ' + value + '!');
      let response = await axios.post( `/make_turn/inform/${userId}`, {'informed_player_id': informedUserId, 'information': value});
      console.log('inform response:');
      console.log(response);
      await handleGetGameStateResponse(response);
      console.log('inform response handling done');
      onActionPopupClose();
    }
    return sendInform;
  };

  const reportPlaceAction = (cardIndex) => {
    async function placeActionFunc() {
      let response = await axios.post('/make_turn/place/' + userId, {'card_index': cardIndex});
      await handleGetGameStateResponse(response);
    }
    return placeActionFunc;
  };

  const reportBurnAction = (cardIndex) => {
    async function burnActionFunc() {
      let response = await axios.post('/make_turn/burn/' + userId, {'card_index': cardIndex});
      await handleGetGameStateResponse(response);
    }
    return burnActionFunc;
  };

  const reportCardMotion = (userId) => {
    async function moveCard(indexFrom, indexTo){
      console.log('Reporting motion!');
      let response = await axios.post(`/move_card/${userId}`,
        {'move_from_index': indexFrom, 'move_to_index': indexTo}
      );
      await handleGetGameStateResponse(response);
    }
    return moveCard;
  };

  const reportUndoCardMotion = (userId) => {
    async function undoCardMotion(){
      console.log('Reporting undo motion!');
      let response = await axios.post('/undo_move_card/' + userId);
      await handleGetGameStateResponse(response);
    }
    return undoCardMotion;
  };

  const startNewGame = async () => {
    let response = await axios.post('/rematch/' + userId);
    await handleGetGameStateResponse(response);  
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
    if(card === undefined){
      return [];
    }
    return [card['color'], card['number']];
  };

  informCard.propTypes = {
    playerId: PropTypes.string.isRequired,
  };

  return (
    <div>
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h3">
                Full game play - game number {gameId}
              </Typography>
            </Paper>
          </Grid>
          <Grid container>
            <Grid 
              container
              direction="column"
              justify="center"
              alignItems="center"          
              xs={5}
            >
              <Grid item justify="center" alignItems="flex-start">
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
                    reportCardMotion={reportCardMotion(userId)}
                    reportUndoCardMotion={reportUndoCardMotion(userId)}
                    tubinMode={tubinMode}
                    stateTimestamp={stateTimestamp}
                  />
                </Paper>
              </Grid>
            </Grid>
            <Grid 
              container
              direction="column"
              justify="center"
              alignItems="center"          
              xs={2}
            >
              <Grid             
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <Paper className={classes.paper}>
                    <button onClick={startNewGame}>Start a new game!</button>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper className={classes.paper}>
                    <FullTokenPile clueTokens={+clueTokens} missTokens={+missTokens}/> <br/><br/>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper className={classes.paper}>
                    <RemainingDeck remainingCards={remainingDeckSize}/>
                  </Paper>
                  <Grid item>
                    <Paper className={classes.paper}>
                      <button style={{backgroundColor: tubinModes[tubinMode].BACKCOLOR, fontWeight: 'bold'}} onClick={() => settubinMode((tubinMode + 1) % tubinModes.length)}>
                      Tubin Mode!
                      </button>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid 
              container
              direction="column"
              justify="center"
              alignItems="center"          
              xs={5}
            >
              <Grid 
                container
                direction="column"
                justify="flex-start"
                alignItems="center"          
              >
                <Grid item>
                  <Paper className={classes.paper}>
                    <HanabiTable 
                      table={hanabiTable} 
                      placeActionFunc={reportPlaceAction(draggedIndex)} 
                      isMyTurn={userId === activePlayer}/>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper className={classes.paper}>
                    <BurntPile 
                      cardList={burntPileCards} 
                      reportBurnAction={reportBurnAction(draggedIndex)} 
                      isMyTurn={userId === activePlayer}/>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>

  );
}

HanabiBoard.propTypes = {
  handleGetGameStateResponse: PropTypes.func.isRequired,
  gameId: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
  clueTokens: PropTypes.number.isRequired,
  missTokens: PropTypes.number.isRequired,
  remainingDeckSize: PropTypes.number.isRequired,
  hanabiTable: PropTypes.object.isRequired,
  activePlayer: PropTypes.string.isRequired,
  burntPileCards: PropTypes.array.isRequired,
  lastAction: PropTypes.object,
  stateTimestamp: PropTypes.number.isRequired
};


const stringifyTurnTime = (timeSec) => {
  let minutes = Math.floor(timeSec / 60);
  let seconds = Math.floor(timeSec - 60 * minutes);
  return minutes + (seconds < 10 ? ':0' : ':') + seconds;
};


function PlayersHands(props) {
  const {players, activePlayer, draggedIndex, onDraggedIndex, onInformCard, lastAction, reportCardMotion, reportUndoCardMotion, tubinMode, stateTimestamp} = props;
  const userId = useContext(UserIdContext);
  const divWidth = (getPlayerCards(players, players[0]['id']).length + 0.25) * (CARD_WIDTH + 10); // the width of a card. Not sure why I need the 0.25

  console.log(players);

  const amISnappir = (players[0]['id'] === userId && players[0]['display_name'].includes('Snap'));

  return (
    <>
      {players.map((player) => 
        <div 
          key={'player_div+' + player['id']}
          style={{width: divWidth + 'px', border: player['id'] === activePlayer ? '2px solid red' : 'none'}}
        >
          {lastAction && player['id'] === lastAction['informed_player'] &&
            <span><font color="blue">Be informed about: {lastAction['information_data']}</font></span>
          }
          <h3 style={{
            float: 'right', 
            position: 'relative',
            top: .5 * CARD_HEIGHT,
          }}>
            {amISnappir && stringifyTurnTime(player['total_turns_time'] + (player['id'] === activePlayer ? ((new Date()).getTime() / 1000 - stateTimestamp) : 0))}
          </h3>
          {player['id'] === userId ?
            <OwnHand 
              cards={getPlayerCards(players, player['id'])} 
              setDraggedIndex={onDraggedIndex} 
              draggedIndex={draggedIndex}
              reportCardMotion={reportCardMotion}
              reportUndoCardMotion={reportUndoCardMotion}
              tubinMode={tubinMode}
            />
            :
            <Player
              userId={player['id']}
              displayName={player['display_name']} 
              cards={getPlayerCards(players, player['id'])}
              onClick={onInformCard(player['id'])}
              tubinMode={tubinMode > 1 ? tubinMode : 0}
            />
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
  reportCardMotion: PropTypes.func.isRequired,
  reportUndoCardMotion: PropTypes.func.isRequired,
  tubinMode: PropTypes.number.isRequired,
  stateTimestamp: PropTypes.number.isRequired
};

function GamePlay(props) {
  const userId = useContext(UserIdContext);
  const {gameId, setGameId} = props;
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [availableClueTokens, setAvailableClueTokens] = useState(MAX_CLUE_TOKENS);
  const [availableMissTokens, setAvailableMissTokens] = useState(MAX_MISS_TOKENS);
  const [remainingDeckSize, setRemainingDeckSize] = useState(-1);
  const [hanabiTable, setHanabiTable] = useState([]);
  const [activePlayer, setActivePlayer] = useState(-1);
  const [burntPileCards, setBurntPileCards] = useState([]);
  const [lastAction, setLastAction] = useState(undefined);
  const [gameResult, setGameResult] = useState('ongoin');
  const [stateTimestamp, setStateTimestamp] = useState(-1);

  const updateGameState = async () => {
    try {
      console.log({'game_id': gameId});
      const request = (userId !== 'spectator' ? '/player_state/' + userId : '/game_state/' + gameId);
      const response = await axios.get(request);
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
    console.log(response);
    if(response.status !== 200){
      console.log('Request failed so no update occurs');
      return;
    }
    let myJson = response.data;

    setAvailableClueTokens(myJson['blue_tokens']);
    setAvailableMissTokens(myJson['red_tokens']);

    setPlayers(myJson['hands']);
    setGameResult(myJson['result']);
    setRemainingDeckSize(myJson['deck_size']);
    setHanabiTable(myJson['table']);
    setActivePlayer(myJson['active_player_id']);
    setBurntPileCards(myJson['burnt_pile']);
    setLastAction(myJson['last_action']);
    setGameId(myJson['game_id']);
    setStateTimestamp(myJson['state_timestamp']);

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
    <div style={{background: colorByResult[gameResult]}}>
      { !isGameStarted ? 
        <WaitForGameStart gameId={gameId} currPlayers={players}/> 
        :
        <HanabiBoard
          handleGetGameStateResponse={handleGetGameStateResponse}
          gameId={gameId}
          players={players}
          clueTokens={+availableClueTokens}
          missTokens={+availableMissTokens}
          remainingDeckSize={remainingDeckSize}
          hanabiTable={hanabiTable}
          burntPileCards={burntPileCards}
          activePlayer={activePlayer}
          lastAction={lastAction}
          stateTimestamp={stateTimestamp}
        />
      }
    </div>
  );
}

GamePlay.propTypes = {
  gameId: PropTypes.string.isRequired,
  setGameId: PropTypes.func.isRequired,
};

export default GamePlay;