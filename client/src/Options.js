import React, { Component, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import GamePlay from './GamePlay';
import {UserIdContext} from './themes.js';

function JoinGame(props) {
  const {onJoinGame} = props;
  const userId = useContext(UserIdContext);
  const [joinGame, setJoinGame] = useState(false);
  const PIN_code = React.createRef();

  const handleMainButtonClick = () => {
    setJoinGame(!joinGame);
  };
    
  const handleJoinGameResponse = (response) => {
    console.log(response);
    var pin = PIN_code.current.value;
    onJoinGame(pin);
  };

  const handleJoinGameError = (reason) =>  {
    // TODO
    console.log(reason);
  };

  const handleJoinClick = async () => {
    const pin = PIN_code.current.value;    
    console.log(pin);

    try {
      const response = await axios.post('/join_game/' + userId + '/' + pin, {});
      handleJoinGameResponse(response);
    } catch (error) {
      handleJoinGameError(error);
    }
  };

  if (joinGame) {
    return (
      <div>
        <button className='button' onClick={handleMainButtonClick}>Don't Join Game</button>
        <br/>
        PIN code:
        <input type="text" ref={PIN_code}/>
        <button className='button' onClick={handleJoinClick}>Join!</button> <br/>
      </div>
    );
  } else {
    return <button className='button' onClick={handleMainButtonClick}>Join Game</button>;
  }

  //   return (
  //     <>
  //       {(!joinGame) ? 
  //         <button className='button' onClick={handleMainButtonClick}>Join Game</button>
  //         :
  //         <div>
  //           <button className='button' onClick={handleMainButtonClick}>Don't Join Game</button>
  //           <br/>
  //                   PIN code:
  //           <input type="text" ref={PIN_code}/>
  //           <button className='button' onClick={handleJoinClick}>Join!</button> <br/>
  //         </div>}
  //     </>
  //   );

}

JoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
};


class Options extends Component {
    static contextType = UserIdContext;

    constructor (props) {
      super(props);
      this.state = {
        start_game: false,
        game_id: ''
      }  ;
      this.create_game = this.create_game.bind(this);
      this.handleJoinGame = this.handleJoinGame.bind(this);
    }

    create_game() {
      axios.post('/create_game/' + this.context, {}).
        then(response => this.handle_create_game_response(response), 
          reason => this.handle_create_game_error(reason));
    }

    handle_create_game_response(response) {
      console.log(response);
      this.setState({game_id: response.data.game_id});
      this.setState({start_game: true});
    }

    handle_create_game_error(reason) {
      // TODO
    }

    handleJoinGame(input_game_id) {
      this.setState({game_id: input_game_id});
      this.setState({start_game: true});
    }

    render_start_game() {
      return (
        <div className='main__container'>
          <GamePlay game_id={this.state.game_id} />
        </div>
      );
    }

    render_regular () {
      return (
        <div className='main__container'>
                User {window.$id} -  What Do You Want To Do? <br/> <br/>
          <button className='button' onClick={this.create_game}> Create Game </button> <br/> <br/>
          <JoinGame onJoinGame={this.handleJoinGame} />
        </div>
      );
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

export default Options;