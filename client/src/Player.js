import React from 'react';
import './Player.css';
import PropTypes from 'prop-types';

const COLOR_TO_ROW = {'red': 0, 'yellow': 1, 'green': 2, 'blue': 3, 'white': 4, 'rainbow': 5};


function PlayerCards(props) {
  let {cards} = props;

  const cardToImagePos = (number, color) => {
    let posX = (+number - 1) * (-100);
    let posY = COLOR_TO_ROW[color] * (-100);
    return [posX, posY];
  };

  const renderCards = () => {
    let out_cards = [];
    for (let index = 0; index < cards.length; index++) {
      let pos_arr = cardToImagePos(cards[index]['number'], cards[index]['color']);
      out_cards.push(<div className='card' 
        style={{backgroundPositionX :pos_arr[0] + '%', backgroundPositionY :pos_arr[1] + '%'}} key={index}></div>);
    }
    return out_cards;
  };

  return (
    <div>
      {renderCards()}
    </div>
  );
}

PlayerCards.propTypes = {
  cards: PropTypes.array.isRequired,
};


function Player(props) {
  const { displayName, userId, cards } = props;
  
  return (
    <div>
      Welcome {displayName}! <br/>
      <PlayerCards cards={cards}/>
    </div>
  );

}

Player.propTypes = {
  displayName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
};

export default Player;