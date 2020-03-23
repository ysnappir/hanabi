import React, { Component } from 'react'
import clue_token from './img/clue.png'
import miss_token from './img/miss.png'

const TOKENS_ARR = { "clue" : clue_token, "miss" : miss_token }

const MAX_CLUE_TOKENS = 8
const MAX_MISS_TOKENS = 3

class SingleTokenPile extends Component {
    constructor (props) {
        super(props)
        this.state = {
            clue_tokens: this.props.initial_clue_tokens_num,
            miss_tokens: this.props.initial_miss_tokens_num
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

class FullTokenPile extends Component {
    render () {
        return (
            <div>
                Available Tokens: <SingleTokenPile initial_clue_tokens_num={MAX_CLUE_TOKENS} initial_miss_tokens_num={MAX_MISS_TOKENS}/>
                <br/><br/>
                Used Tokens: <SingleTokenPile initial_clue_tokens_num="0" initial_miss_tokens_num="0"/>
            </div>
        )
    }

}

export default FullTokenPile