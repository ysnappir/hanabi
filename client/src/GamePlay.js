import React, { Component } from 'react'
import axios from 'axios'
import FullTokenPile from './Tokens.js'
import Player, {TEST_CARDS} from './Player.js'

const TEST_JSON = '{"deck_size": 42, "blue_tokens": 5, "red_tokens": 2, "table": {"rainbow": 3, "blue": null, "red": 5}, "hands": [{"id": "p_0", "display_name": "Snap", "cards": [{"number": 3, "color": "red"}, {"number": 3, "color": "red"}]}, {"id": "p_1", "display_name": "Ethan", "cards": [{"number": 5, "color": "blue"}, {"number": 3, "color": "red"}]}, {"id": "p_2", "display_name": "Amos", "cards": [{"number": 2, "color": "yellow"}, {"number": 1, "color": "white"}]}], "burnt_pile": [{"number": 2, "color": "yellow"}, {"number": 2, "color": "yellow"}, {"number": 2, "color": "yellow"}]}';

class GamePlay extends Component {
    constructor (props) {
        super(props)
        this.state = {
            players: {}
        }
        this.tokens_pile = React.createRef();
        this.playersRefs = [];
      }

      componentDidMount() {
        this.interval = setInterval(() => this.update_game(TEST_JSON), 1000);
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

      update_game(game_json) {
        var myJson = JSON.parse(game_json);

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

        // this.player.current.update_cards(TEST_CARDS);
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

    render () {
        return (
        <div>
            Full game play <br/> <br/>
            Tokens Status: <br/>
            <FullTokenPile ref={this.tokens_pile}/>
            <br/><br/>
            {this.render_players()}
        </div>
        )
    }
}
export default GamePlay