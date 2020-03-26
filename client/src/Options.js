import React, { Component } from 'react'
import axios from 'axios'
import GamePlay from './GamePlay';

class JoinGame extends Component {
    constructor (props) {
        super(props)
        this.state = {
            join_game: false
          }  
          this.PIN_code = React.createRef();
          this.main_button_click = this.main_button_click.bind(this)
          this.join_click = this.join_click.bind(this)
      }

      main_button_click() {
        this.setState({join_game: !this.state.join_game});
    }

    join_click() {
        var pin = this.PIN_code.current.value;
        console.log(pin)
        axios.post('http://127.0.0.1:8080/join_game/' + window.$id + '/' + pin, {}).
        then(response => this.handle_join_game_response(response), 
        reason => this.handle_join_game_error(reason));

    }

    handle_join_game_response(response) {
        console.log(response)
        this.props.join_game_func();
    }

    handle_join_game_error(reason) {
        // TODO
    }

    render_join_game() {
        return (
            <div>
                <button className='button' onClick={this.main_button_click}>
                    Don't Join Game
                </button> <br/>
                PIN code:
                <input type="text" ref={this.PIN_code} />

                <button className='button' onClick={this.join_click}>
                    Join!
                </button> <br/>
            </div>
        )
    }
    
    render_regular() {
        return (
            <div>
                <button className='button' onClick={this.main_button_click}>
                    Join Game
                </button>
            </div>
            )    
    }

    render () {
        if (!this.state.join_game) {
            return this.render_regular();
        }
        else {
            return this.render_join_game();
        }
    }

}

class Options extends Component {
    constructor (props) {
        super(props)
        this.state = {
            start_game: false,
            game_pin: ''
          }  
          this.create_game = this.create_game.bind(this)
          this.join_game = this.join_game.bind(this)
      }

      create_game() {
        axios.post('http://127.0.0.1:8080/create_game/' + window.$id, {}).
        then(response => this.handle_create_game_response(response), 
        reason => this.handle_create_game_error(reason));
      }

      handle_create_game_response(response) {
          console.log(response)
        window.$game_id = response.data.game_id;
          this.setState({start_game: true})
      }

      handle_create_game_error(reason) {
          // TODO
      }

      join_game() {
        this.setState({start_game: true})
      }

      render_start_game() {
          return (
        <div className='main__container'>
            <GamePlay game_id={window.$game_id} />
        </div>
          )
      }

      render_regular () {
        return (
            <div className='main__container'>
                User {window.$id} -  What Do You Want To Do? <br/> <br/>
                <button className='button' onClick={this.create_game}> Create Game </button> <br/> <br/>
                <JoinGame join_game_func={this.join_game} />
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