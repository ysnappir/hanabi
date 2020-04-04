import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FullTokenPile from './Tokens.js';
import Player from './Player.js';
import {UserIdContext} from './Contex.js';
import {MAX_CLUE_TOKENS, MAX_MISS_TOKENS} from './Tokens.js';
import RemainingDeck, {HanabiTable, BurntPile} from './CardPiles.js';
import {CARD_WIDTH} from './Cards.js';

function WaitForGameStart(props) {
  const {gameId, currPlayers } = props;

  const renderPlayersDisplayName = () => {
    let outPlayers = [];
    if (currPlayers.length > 0) {
      outPlayers = currPlayers.map((player, index) => <li key={index}>{player['display_name']}</li>);
    }
    return <ul>{outPlayers}</ul>;
  };

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
      {renderPlayersDisplayName()}
      <button onClick={onStartGameClick}>Start Game</button>
    </div>
  );
}

WaitForGameStart.propTypes = {
  gameId: PropTypes.string.isRequired,
  currPlayers: PropTypes.array.isRequired,
};



function HanabiBoard(props) {
  const {gameId, players, clueTokens, missTokens, remainingDeckSize, hanabiTable, activePlayer, burntPileCards} = props;

  const getPlayerCards = (id) => {
    for (let index = 0; index < players.length; index++) {
      let player = players[index];
      if (player['id'] == id) {
        return player['cards'];
      }
    }

    return [];
  };

  const renderPlayers = () => {
    let out_players = [];
    if (players.length > 0) {
      let divWidth = (getPlayerCards(players[0]['id']).length + 0.25) * CARD_WIDTH; // the width of a card. Not sure why I need the 0.25
      out_players = players.map((player) => 
        <div key={'player_div+' + player['id']}
          style={{width: divWidth + 'px', border: player['id'] == activePlayer ? '2px solid red' : 'none'}}>
          <Player userId={player['id']} displayName={player['display_name']} 
            cards={getPlayerCards(player['id'])} key={player['id']} />
        </div>
      );
    }
    return out_players;
  };

  return (
    <div>
      <h1>Full game play - game number {gameId}</h1> <br/><br/>
      Tokens Status: <br/>
      <FullTokenPile clueTokens={+clueTokens} missTokens={+missTokens}/> <br/><br/>
      <RemainingDeck remainingCards={remainingDeckSize}/>
      <HanabiTable table={hanabiTable}/>
      {renderPlayers()}
      <BurntPile cardList={burntPileCards}/>
      <h1>End of board</h1>
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
  activePlayer: PropTypes.number.isRequired,
  burntPileCards: PropTypes.array.isRequired,
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

  const updateGameState = async () => {
    try {
      const response = await axios.post('/game_state/' + userId + '/' + gameId, {});
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

    setAvailableClueTokens(myJson['blue_tokens']);
    setAvailableMissTokens(myJson['red_tokens']);

    setPlayers(myJson['hands']);

    setRemainingDeckSize(myJson['deck_size']);
    setHanabiTable(myJson['table']);
    setActivePlayer(myJson['active_player_id']);
    setBurntPileCards(myJson['burnt_pile']);
    
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
    <div>
      { !isGameStarted ? 
        <WaitForGameStart gameId={gameId} currPlayers={players}/> :
        <HanabiBoard gameId={gameId} players={players} clueTokens={+availableClueTokens} missTokens={+availableMissTokens}
          remainingDeckSize={remainingDeckSize} hanabiTable={hanabiTable} burntPileCards={burntPileCards} activePlayer={+activePlayer}/> }
    </div>
  );
}

GamePlay.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default GamePlay;