import React, { useEffect, useContext, useState, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FullTokenPile from './Tokens.js';
import Player from './Player.js';
import {UserIdContext} from './themes.js';

function GamePlay(props) {
  const userId = useContext(UserIdContext);
  const {gameId} = props;
  const [players, setPlayers] = useState(undefined);
  const tokensPile = React.createRef();

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
        var player = players[index];
        if (player['id'] == id) {
          return player['cards'];
        }
      }
    }
    return [];
  };

  const handleGetGameStateResponse = (response) => {
    let myJson = response.data;

    let clueTokens = myJson['blue_tokens'];
    let missTokens = myJson['red_tokens'];
    tokensPile.current.set_available_clue_tokens(clueTokens);
    tokensPile.current.set_available_miss_tokens(missTokens);

    let json_players = myJson['hands'];
    setPlayers(json_players);
  };

  const handleGetGameStateError = (reason) => {
    console.log(reason);
  };


  const renderPlayers = () => {
    let out_players = [];
    if (players !== undefined && players.length > 0) {
      out_players = players.map((player, index) => 
        <Player userId={player['id']} displayName={player['display_name']} 
          cards={getPlayerCards(player['id'])}
          key={player['id']} 
        />);
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
      <FullTokenPile ref={tokensPile}/> <br/><br/>
      <button onClick={onStartGameClick}>Start Game</button>
      {renderPlayers()}
    </div>
  );
}

GamePlay.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default GamePlay;