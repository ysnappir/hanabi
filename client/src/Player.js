/*eslint linebreak-style: ["error", "unix"]*/

import React from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import { useDrag, useDrop } from 'react-dnd';


export const ItemTypes = {
  DraggableOwnCard: 'OwnCard',
};


function OwnCard(props) {
  let {index} = props;

  const [{ isDragging }, drag] = useDrag({
    item: {type: ItemTypes.DraggableOwnCard},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.DraggableOwnCard,
    drop: () => logIndex(),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const logIndex = () => {
    console.log('index is ' + index);
  };

  const renderDragging = () => {
    console.log('rendering drag ' + index);
    return (  
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.1 : 1,
          cursor: 'move',
        }}
      >
        <img src={require ('./img/BackRect125.png')} onClick={logIndex}/>
      </div>
    );
  };

  const renderOver = () => {
    console.log('rendering over ' + index);
    return (  
      <div
        ref={drop}
        style={{
          opacity: isOver ? 0.1 : 1,
          cursor: 'move',
        }}
      >
        <img src={require ('./img/BackRect125.png')} onClick={logIndex}/>
      </div>
    );
  };

  if (isOver)
    return renderOver();
  else
    return renderDragging();
}

OwnCard.propTypes = {
  index: PropTypes.number.isRequired,
};

export function OwnHand(props) {

  let {cards} = props;

  const renderDragAndDropableHand = () => {
    let outCards = [];
    for (let index = 0; index < cards.length; index++) {
      outCards.push(<OwnCard index={index} key={'own' + index}/>);
    }
    return <div>{outCards}</div>;
  };

  return (
    <div>
      {renderDragAndDropableHand()}
    </div>
  );
}

OwnHand.propTypes = {
  cards: PropTypes.array.isRequired,
};

function PlayerCards(props) {
  let {cards} = props;
  
  const renderCards = () => {
    let outCards = [];
    for (let index = 0; index < cards.length; index++) {
      if(cards[index] != null){
        let cardPath = cardToImageFile(cards[index]['number'], cards[index]['color']);
        outCards.push(<img src={cardPath} key={index}/>);
      }
      else{
        outCards.push(<img src={require ('./img/BackRect125.png')} key={index}/>);
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