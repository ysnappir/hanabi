import React, { Component } from 'react'
import axios from 'axios'
import FullTokenPile from './Tokens.js'
import Player, {TEST_CARDS} from './Player.js'
import {UserIdContext} from './themes.js'

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
export default GamePlay