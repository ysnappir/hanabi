import React, { Component } from 'react'
import clue_token from './img/clue.png'
import miss_token from './img/miss.png'

const TOKENS_ARR = { "clue" : clue_token, "miss" : miss_token }

const MAX_CLUE_TOKENS = '8'
const MAX_MISS_TOKENS = '3'

class SingleTokenPile extends Component {
    constructor (props) {
        super(props)
        this.state = {
            clue_tokens: this.props.initial_clue_tokens_num,
            miss_tokens: this.props.initial_miss_tokens_num
        }
        this.get_available_clue_tokens = this.get_available_clue_tokens.bind(this);
    }

    get_available_clue_tokens() {
        return this.state.clue_tokens;
    }

    get_available_miss_tokens() {
        return this.state.miss_tokens;
    }

    set_available_clue_tokens(num_of_tokens) {
        this.setState({clue_tokens: num_of_tokens})
    }

    set_available_miss_tokens(num_of_tokens) {
        this.setState({miss_tokens: num_of_tokens})
    }

    use_clue_token() {
        if (this.get_available_clue_tokens() > '0') {
            this.setState({clue_tokens: +this.state.clue_tokens - 1})
        }
    }

    use_miss_token() {
        if (this.get_available_miss_tokens() > '0') {
            this.setState({miss_tokens: +this.state.miss_tokens - 1})
        }
    }

    add_clue_token() {
        this.setState({clue_tokens: +this.state.clue_tokens+1})
    }

    add_miss_token() {
        this.setState({miss_tokens: +this.state.miss_tokens + 1})
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
    constructor (props) {
        super(props)
        this.available_tokens_pile = React.createRef();
        this.used_tokens_pile = React.createRef();

        this.use_clue_token = this.use_clue_token.bind(this);
        this.use_miss_token = this.use_miss_token.bind(this);
      }

    get_available_clue_tokens() {
        return this.available_tokens_pile.current.get_available_clue_tokens()
    }

    get_available_miss_tokens() {
        return this.available_tokens_pile.current.get_available_miss_tokens()
    }

    has_available_clue_tokens() {
        return this.get_available_clue_tokens() != '0';
    }

    has_available_miss_tokens() {
        return this.get_available_miss_tokens() != '0';
    }

    use_miss_token() {
        if (this.has_available_miss_tokens()) {
            this.available_tokens_pile.current.use_miss_token();
            this.used_tokens_pile.current.add_miss_token();
        }
        else {
            /* No Tokens Available! */
        }
    }

    use_clue_token() {
        if (this.has_available_clue_tokens()) {
            this.available_tokens_pile.current.use_clue_token();
            this.used_tokens_pile.current.add_clue_token();
        }
        else {
            /* No Tokens Available! */
        }
    }

    set_available_clue_tokens(num_of_tokens) {
        this.available_tokens_pile.current.set_available_clue_tokens(num_of_tokens);
        this.used_tokens_pile.current.set_available_clue_tokens(+MAX_CLUE_TOKENS - num_of_tokens);
    }

    set_available_miss_tokens(num_of_tokens) {
        this.available_tokens_pile.current.set_available_miss_tokens(num_of_tokens);
        this.used_tokens_pile.current.set_available_miss_tokens(+MAX_MISS_TOKENS - num_of_tokens);
    }

    render () {
        return (
            <div>
                Available Tokens: <SingleTokenPile 
                    initial_clue_tokens_num={MAX_CLUE_TOKENS} initial_miss_tokens_num={MAX_MISS_TOKENS}
                    ref={this.available_tokens_pile}/>
                <br/><br/>
                Used Tokens: <SingleTokenPile initial_clue_tokens_num='0' initial_miss_tokens_num='0'
                    ref={this.used_tokens_pile}/>
                <br/><br/>
                <button onClick={this.use_clue_token}>Give Clue!</button>
                <button onClick={this.use_miss_token}>Miss!</button>
            </div>
        )
    }

}

export default FullTokenPile