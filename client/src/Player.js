import React from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';


function PlayerCards(props) {
  let {cards, onSelfCardClick} = props;
  
  const renderCards = () => {
    let outCards = [];
    for (let index = 0; index < cards.length; index++) {
      if(cards[index] != null){
        let cardPath = cardToImageFile(cards[index]['number'], cards[index]['color']);
        outCards.push(<img src={cardPath} key={index}/>);
      }
      else{
        outCards.push(<img src={require ('./img/BackRect125.png')} onClick={() => onSelfCardClick(index)} key={index}/>);
      }
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
  onSelfCardClick: PropTypes.func.isRequired,
};


function Player(props) {
  const { displayName, cards , onSelfCardClick} = props;
  
  return (
    <div>
      Welcome {displayName}! <br/>
      <PlayerCards cards={cards} onSelfCardClick={onSelfCardClick}/>
    </div>
  );

}

Player.propTypes = {
  displayName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  onSelfCardClick: PropTypes.func.isRequired,
};

export default Player;