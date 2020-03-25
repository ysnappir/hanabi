import React, { Component } from 'react'
import axios from 'axios'
import FullTokenPile from './Tokens.js'
import Player, {TEST_CARDS} from './Player.js'

const TEST_JSON = '{"deck_size": 42, "blue_tokens": 5, "red_tokens": 2, "table": {"rainbow": 3, "blue": null, "red": 5}, "hands": [{"id": "p_0", "display_name": "Snap", "cards": [{"number": 3, "color": "red"}, {"number": 3, "color": "red"}]}, {"id": "p_1", "display_name": "Ethan", "cards": [{"number": 5, "color": "blue"}, {"number": 3, "color": "red"}]}, {"id": "p_2", "display_name": "Amos", "cards": [{"number": 2, "color": "yellow"}, {"number": 1, "color": "white"}]}], "burnt_pile": [{"number": 2, "color": "yellow"}, {"number": 2, "color": "yellow"}, {"number": 2, "color": "yellow"}]}';

class GamePlay extends Component {
    constructor (props) {
        super(props)
        this.state = {
            players: []
        }
        this.tokens_pile = React.createRef();
        this.player = React.createRef();
      }

      componentDidMount() {
        this.interval = setInterval(() => this.update_game(TEST_JSON), 1000);
      }
      componentWillUnmount() {
        clearInterval(this.interval);
      }
      
      update_game(game_json) {
        var myJson = JSON.parse(game_json);

        var clue_tokens = myJson['blue_tokens']
        var miss_tokens = myJson['red_tokens']
        this.tokens_pile.current.set_available_clue_tokens(clue_tokens)
        this.tokens_pile.current.set_available_miss_tokens(miss_tokens)

        var players = myJson['hands'];
        

        this.player.current.update_cards(TEST_CARDS);
      }

    render () {
        return (
        <div>
            Full game play <br/> <br/>
            Tokens Status: <br/>
            <FullTokenPile ref={this.tokens_pile}/>
            <br/><br/>
            <Player display_name='asdf' ref={this.player}/>
        </div>
        )
    }
}
export default GamePlay