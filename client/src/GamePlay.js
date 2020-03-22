import React, { Component } from 'react'
import axios from 'axios'
import clue_token from './img/clue.png'
import miss_token from './img/miss.png'

const TOKENS_ARR = { "clue" : clue_token, "miss" : miss_token }

class TokenPile extends Component {
    constructor () {
        super()
        this.state = {
            clue_tokens: 8,
            miss_tokens: 3
        }
    }

    draw_tokens (token_type, num_of_tokens) {
        const out_tokens = []
        for (let index = 0; index < num_of_tokens; index++) {
            var uniq_key = token_type + index;
            out_tokens.push(<img src={TOKENS_ARR[token_type]} alt="" key={uniq_key}/>);
        }
        return out_tokens;
    }

    render () {
        return (
            <div>                
                Clue Tokens:
                {this.draw_tokens("clue", this.state.clue_tokens)}
                <br/> <br/>
                Miss Tokens:
                {this.draw_tokens("miss", this.state.miss_tokens)}
            </div>
        )
    }
}

class GamePlay extends Component {
    constructor () {
        super()
      }

    render () {
        return (
        <div className='main__container'>
            Full game play <br/> <br/>
            <TokenPile/>
        </div>
        )
    }
}
export default GamePlay