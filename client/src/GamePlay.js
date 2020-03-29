import React, { useEffect, useContext, useState } from 'react';
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

  let playersRefs = [];

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
    for (let index = 0; index < players.length; index++) {
      var player = players[index];
      if (player['id'] == id) {
        return player['cards'];
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

    if (playersRefs.length > 0) {
      playersRefs.map((curr_ref, index) => curr_ref.update_cards(
        getPlayerCards(curr_ref.props.user_id)
      ));
    }
  };

  const handleGetGameStateError = (reason) => {
    console.log(reason);
  };


  const renderPlayers = () => {
    let out_players = [];
    if (players && players.length > 0) {
      out_players = players.map((player, index) => 
        <Player user_id={player['id']} display_name={player['display_name']} ref={ref => { 
          // Callback refs are preferable when 
          // dealing with dynamic refs
          playersRefs[index] = ref; 
        }} key={player['id']} 
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
  gameId: PropTypes.number.isRequired,
};

/*
class GamePlay extends Component {
  static contextType = UserIdContext;

  constructor (props) {
    super(props)
    this.state = {
      players: {}
    }
    this.tokens_pile = React.createRef();
    this.playersRefs = [];
    this.send_start_game = this.send_start_game.bind(this)
  }

  componentDidMount() {
    this.interval = setInterval(() => this.update_game(), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
      
  get_player_cards(players, id) {
    for (let index = 0; index < players.length; index++) {
      var player = players[index];
      if (player['id'] == id) {
        return player['cards']
      }
    }
    return []
  }

  update_game() {
    axios.post('/game_state/' + this.context + '/' + this.props.game_id, {}).
      then(response => this.handle_get_state_response(response), 
        reason => this.handle_get_state_error(reason));
  }

  handle_get_state_response(response) {
    console.log(response)
    console.log(response.data)
    var myJson = response.data;

    var clue_tokens = myJson['blue_tokens']
    var miss_tokens = myJson['red_tokens']
    this.tokens_pile.current.set_available_clue_tokens(clue_tokens)
    this.tokens_pile.current.set_available_miss_tokens(miss_tokens)

    var json_players = myJson['hands'];
    this.setState({players : json_players})
    if (this.playersRefs.length > 0) {
      //this.playersRefs.map((curr_ref, index) => console.log(curr_ref.props.user_id))

      this.playersRefs.map((curr_ref, index) => curr_ref.update_cards(
        this.get_player_cards(json_players, curr_ref.props.user_id)
      ))
    }
  }
  handle_get_state_error(reason) {
    console.log(reason)
  }
  render_players() {
    var out_players = [];
    if (this.state.players.length > 0) {
      var out_players = this.state.players.map((player, index) => 
        <Player user_id={player['id']} display_name={player['display_name']} ref={ref => { 
          // Callback refs are preferable when 
          // dealing with dynamic refs
          this.playersRefs[index] = ref; 
        }} key={player['id']} 
        />)
    }
    //return <Player display_name='asdf' ref={this.player}/>
    return out_players
  }

  send_start_game() {
    axios.post('/start_game/' + this.props.game_id, {})
      .then(response => this.handle_start_game_response(response), 
        reason => this.handle_start_game_error(reason));
  
  }

  handle_start_game_response(response) {
    console.log(response)
  }

  handle_start_game_error(reason) {
    console.log(reason)
  }

  render () {
    return (
      <div>
            Full game play <br/> <br/>
            Tokens Status: <br/>
        <FullTokenPile ref={this.tokens_pile}/>
        <br/><br/>
        <button onClick={this.send_start_game}> Start Game </button>
        {this.render_players()}
      </div>
    )
  }
}
*/

export default GamePlay;