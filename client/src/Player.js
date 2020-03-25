import React, { Component, createRef } from 'react'
import axios from 'axios'
import './Player.css'

const COLOR_TO_ROW = {'red': 0, 'yellow': 1, 'green': 2, 'blue': 3, 'white': 4, 'rainbow': 5}

export const TEST_CARDS = [{"number": 5, "color": "blue"}, {"number": 5, "color": "red"},
                    {"number": 2, "color": "blue"}]

class PlayerCards extends Component {
    constructor (props) {
        super(props)
        this.state = {
            cards: []
        }
      }
      
      card_to_image_pos(number, color) {
        var pos_x = (+number - 1) * (-100);
        var pos_y = COLOR_TO_ROW[color] * (-100);
        return [pos_x, pos_y];
      }

      update_cards(cards_json_list) { // in the form of [{"number": 5, "color": "blue"}]
        this.setState({ cards: cards_json_list})
      }

      draw_cards() {
        const out_cards = []
        for (let index = 0; index < this.state.cards.length; index++) {
            var pos_arr = this.card_to_image_pos(this.state.cards[index]['number'], this.state.cards[index]['color']);
            out_cards.push(<div className='card' 
                            style={{backgroundPositionX :pos_arr[0] + '%', backgroundPositionY :pos_arr[1] + '%'}} key={index}></div>);
        }
        return out_cards;
      }

      render () {
        return (
        <div>
            {this.draw_cards()}
        </div>
        )
    }

}

class Player extends Component {
    constructor (props) {
        super(props)
        this.cards = createRef();
      }

      update_cards(cards_json_list) {
          this.cards.current.update_cards(cards_json_list);
      }

    render () {
        return (
        <div>
            Welcome {this.props.display_name}! <br/>
            <PlayerCards ref={this.cards}/>
        </div>
        )
    }
}
export default Player