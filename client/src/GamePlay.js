import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FullTokenPile from './Tokens.js';
import Player from './Player.js';
import {UserIdContext} from './Contex.js';
import {MAX_CLUE_TOKENS, MAX_MISS_TOKENS} from './Tokens.js';

function GamePlay(props) {
  const userId = useContext(UserIdContext);
  const {gameId} = props;
  const [players, setPlayers] = useState(undefined);
  const [availableClueTokens, setAvailableClueTokens] = useState(MAX_CLUE_TOKENS);
  const [availableMissTokens, setAvailableMissTokens] = useState(MAX_MISS_TOKENS);

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
  
  const getPlayerCards = (id) => {
    if (players !== undefined) {
      for (let index = 0; index < players.length; index++) {
        let player = players[index];
        if (player['id'] == id) {
          return player['cards'];
        }
      }
    }
    return [];
  };

  const handleGetGameStateResponse = (response) => {
    let myJson = response.data;

    setAvailableClueTokens(myJson['blue_tokens']);
    setAvailableMissTokens(myJson['red_tokens']);

    setPlayers(myJson['hands']);
  };

  const handleGetGameStateError = (reason) => {
    console.log(reason);
  };


  const renderPlayers = () => {
    let out_players = [];
    if (players !== undefined && players.length > 0) {
      out_players = players.map((player) => 
        <Player userId={player['id']} displayName={player['display_name']} 
          cards={getPlayerCards(player['id'])} key={player['id']} />
      );
    }
    return out_players;
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
      Full game play <br/> <br/>
      Tokens Status: <br/>
      <FullTokenPile clueTokens={+availableClueTokens} missTokens={+availableMissTokens}/> <br/><br/>
      <button onClick={onStartGameClick}>Start Game</button>
      {renderPlayers()}
    </div>
  );
}

GamePlay.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default GamePlay;