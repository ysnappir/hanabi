/*eslint linebreak-style: ["error", "unix"]*/

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import { useDrag, useDrop } from 'react-dnd';


export const ItemTypes = {
  DraggableOwnCard: 'OwnCard',
};


function OwnCard(props) {
  let {index, onDrag} = props;

  const [{ isDragging }, drag] = useDrag({
    item: {type: ItemTypes.DraggableOwnCard},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  const logIndex = () => {
    console.log('card index is ' + index);
  };

  if (isDragging){
    onDrag(index);
  }

  const renderDragging = () => {
    return (  
      <img src={require ('./img/BackRect125.png')} onClick={logIndex} ref={drag}
        style={{
          opacity: isDragging ? 0.1 : 1,
          cursor: 'move',
        }}/>
    );
  };

  return renderDragging();
}

OwnCard.propTypes = {
  index: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
};

function OwnSlot(props) {
  let {index, onDrag, draggedIndex} = props;

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.DraggableOwnCard,
    drop: () => {
      if(draggedIndex != index)
        console.log('Moving ' + draggedIndex + ' to '  + index);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  /*
  const logIndex = (card_index) => {
    console.log('slot index is ' + index + ' card index in ' + card_index);
  };
  */

  const render = () => {
    return (  
      <span ref={drop} style={{
        opacity: isOver ? 0.5 : 1,
        cursor: 'move',
      }}>
        <OwnCard index={index} onDrag={onDrag}/>
      </span>
    );
  };

  return render();
}

OwnSlot.propTypes = {
  index: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  draggedIndex: PropTypes.number.isRequired,
};

export function OwnHand(props) {

  let {cards} = props;
  const [draggedIndex, setdraggedIndex] = useState(-1);
  //const [droppedIndex, setdroppedIndex] = useState(-1);

  const renderDragAndDropableHand = () => {
    let outCards = [];
    for (let index = 0; index < cards.length; index++) {
      outCards.push(<OwnSlot index={index} key={'slot' + index} onDrag={setdraggedIndex} draggedIndex={draggedIndex}/>);
    }
    return <div>{outCards}</div>;
  };
  /*
  if (draggedIndex > -1 && droppedIndex > -1){
    if (draggedIndex != droppedIndex){
      console.log('Moving ' + draggedIndex + ' to ' + droppedIndex);
    }
    setdraggedIndex(-1);
    setdroppedIndex(-1);
  }
  */
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