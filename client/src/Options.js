/*eslint linebreak-style: ["error", "unix"]*/

import React, { Component, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import GamePlay from './GamePlay';
import {UserIdContext} from './themes.js';

function JoinGame(props) {
  const {onJoinGame} = props;
  const userId = useContext(UserIdContext);
  const [showPinField, setShowPinField] = useState(false);
  const pinCode = React.createRef();

  const handleJoinGameResponse = (response) => {
    console.log(response);
    var pin = pinCode.current.value;
    onJoinGame(pin);
  };

  const handleJoinGameError = (reason) =>  {
    // TODO
    console.log(reason);
  };

  const handleJoinClick = async () => {
    const pin = pinCode.current.value;    
    console.log(pin);

    try {
      const response = await axios.post( `/join_game/${userId}/${pin}`, {});
      handleJoinGameResponse(response);
    } catch (error) {
      handleJoinGameError(error);
    }
  };

  return (
    <>
      <div>
        <button className='button' onClick={() => setShowPinField(!showPinField)}>
          {showPinField ? 'Don\'t Join Game': 'Join Game'}
        </button>
      </div>

      {showPinField && 
      <div>
          PIN code:
        <input type="text" ref={pinCode}/>
        <button className='button' onClick={handleJoinClick}>Join!</button> <br/>
      </div>}
    </>
  );

}

JoinGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
};


function CreateGame(props) {

  const {onCreateGame, onJoinGame} = props;
  
  const userId = useContext(UserIdContext);

  const handleCreateGameResponse = (response) => {
    console.log(response);
    var pin = response.data.game_id;
    onCreateGame();
    onJoinGame(pin);
  };

  const handleCreateClick = async () => {   
    try {
      const response = await axios.post( `/create_game/${userId}`, {});
      handleCreateGameResponse(response);
    } catch (error) {
      //TODO: handle create game error;
      console.log('Create game has thrown and exception');
    }
  };

  return (
    <div>
      <button className='button' onClick={() => handleCreateClick()} />
    </div>
  );

}

CreateGame.propTypes = {
  onJoinGame: PropTypes.func.isRequired,
  onCreateGame: PropTypes.func,
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