import React from 'react';
import './Player.css';
import PropTypes from 'prop-types';

const COLOR_TO_FILE_INDENTIFIER = {'red': 'r', 'yellow': 'y', 'green': 'g', 'blue': 'b', 'white': 'w', 'rainbow': 'rb'};

const cardsImages = {
  r1:  require('./img/cards/card_1r.png'),
  r2:  require('./img/cards/card_2r.png'),
  r3:  require('./img/cards/card_3r.png'),
  r4:  require('./img/cards/card_4r.png'),
  r5:  require('./img/cards/card_5r.png'),

  b1:  require('./img/cards/card_1b.png'),
  b2:  require('./img/cards/card_2b.png'),
  b3:  require('./img/cards/card_3b.png'),
  b4:  require('./img/cards/card_4b.png'),
  b5:  require('./img/cards/card_5b.png'),

  g1:  require('./img/cards/card_1g.png'),
  g2:  require('./img/cards/card_2g.png'),
  g3:  require('./img/cards/card_3g.png'),
  g4:  require('./img/cards/card_4g.png'),
  g5:  require('./img/cards/card_5g.png'),

  w1:  require('./img/cards/card_1w.png'),
  w2:  require('./img/cards/card_2w.png'),
  w3:  require('./img/cards/card_3w.png'),
  w4:  require('./img/cards/card_4w.png'),
  w5:  require('./img/cards/card_5w.png'),

  y1:  require('./img/cards/card_1y.png'),
  y2:  require('./img/cards/card_2y.png'),
  y3:  require('./img/cards/card_3y.png'),
  y4:  require('./img/cards/card_4y.png'),
  y5:  require('./img/cards/card_5y.png'),

  rb1:  require('./img/cards/card_1rb.png'),
  rb2:  require('./img/cards/card_2rb.png'),
  rb3:  require('./img/cards/card_3rb.png'),
  rb4:  require('./img/cards/card_4rb.png'),
  rb5:  require('./img/cards/card_5rb.png'),
};


function PlayerCards(props) {
  let {cards} = props;
  
  const cardToImageFile = (number, color) => {
    let cardProp = COLOR_TO_FILE_INDENTIFIER[color] + number;
    return cardsImages[cardProp];
  };

  const renderCards = () => {
    let outCards = [];
    for (let index = 0; index < cards.length; index++) {
      let cardPath = cardToImageFile(cards[index]['number'], cards[index]['color']);
      outCards.push(<img src={cardPath} key={index}/>);
    }
    return <div>{outCards}</div>;
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
  const { displayName, cards } = props;
  
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