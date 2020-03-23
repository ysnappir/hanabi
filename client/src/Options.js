import React, { Component } from 'react'
import axios from 'axios'
import GamePlay from './GamePlay';

class JoinGame extends Component {
    constructor () {
        super()
        this.state = {
            join_game: false,
            join_pin: false
          }  
          this.PIN_code = React.createRef();
          this.join_game_click = this.join_game_click.bind(this)
          this.join_pin_click = this.join_pin_click.bind(this)
      }

    join_game_click() {
        this.setState({join_game: !this.state.join_game});
    }

    join_pin_click() {
        //this.props.
        this.setState({join_pin: true});
    }

    render_join_game() {
        return (
            <div>
                <button className='button' onClick={this.join_game_click}>
                    Don't Join Game
                </button> <br/>
                PIN code:
                <input type="text" ref={this.PIN_code} />

                <button className='button' onClick={this.join_pin_click}>
                    Join!
                </button> <br/>
            </div>
        )
    }
    
    render_regular() {
        return (
            <div>
                <button className='button' onClick={this.join_game_click}>
                    Join Game
                </button>
            </div>
            )    
    }

    render_game() {
        return (
            <div>
                <GamePlay />
            </div>
        )
    }

    render () {
        if (this.state.join_pin) {
            return this.render_game();
        }

        if (!this.state.join_game) {
            return this.render_regular();
        }
        else {
            return this.render_join_game();
        }
    }

}

class Options extends Component {
    constructor () {
        super()
        this.state = {
            start_game: false
          }  

      }

      start_game() {
          this.setState({start_game: true})
      }

      render_start_game() {
          return (
        <div className='main__container'>
            <GamePlay />
        </div>
          )
      }

      render_regular () {
        return (
            <div className='main__container'>
                What Do You Want To Do? <br/> <br/>
                <button className='button'>
                    Start Game
                </button> <br/> <br/>
                <JoinGame start_game_func={this.start_game} />
            </div>
            )
      }


    render () {
        if (this.state.start_game) {
            return this.render_start_game();
        }
        else {
            return this.render_regular();
        }
    }
}
export default Options