/*eslint linebreak-style: ["error", "unix"]*/

import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import {UserIdContext} from './Contex.js';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';


export const ItemTypes = {
  DraggableOwnCard: 'OwnCard',
};


function OwnCard(props) {
  let {index, onDrag, ondblclick} = props;

  const [{ isDragging }, drag] = useDrag({
    item: {type: ItemTypes.DraggableOwnCard},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  if (isDragging){
    onDrag(index);
  }

  const renderDragging = () => {
    return (  
      <img src={require ('./img/BackRect125.png')} ref={drag} onDoubleClick={ondblclick}
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
  ondblclick: PropTypes.func,
};

function OwnSlot(props) {

  const userId = useContext(UserIdContext);
  let {index, onDrag, draggedIndex} = props;

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.DraggableOwnCard,
    drop: () => {
      moveCard(draggedIndex, index);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const moveCard = (indexFrom, indexTo) => {
    console.log('Moving ' + indexFrom + ' to '  + indexTo);
    axios.post( `/move_card/${userId}`, 
      {'move_from_index': indexFrom, 'move_to_index': indexTo}
    );
  };

  const render = () => {
    return (  
      <span ref={drop} style={{
        opacity: isOver ? 0.5 : 1,
        cursor: 'move',
      }}>
        <OwnCard index={index} onDrag={onDrag} ondblclick={() => moveCard(index, index)}/>
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
      {displayName} hand: <br/>
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