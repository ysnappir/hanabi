import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import {UserIdContext} from './Contex.js';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';

export const DraggableType = {
  DraggableOwnCard: 'OwnCard',
};

function OwnCard(props) {
  const {index, onDrag, onDoubleClick, card} = props;

  const [{ isDragging }, drag] = useDrag({
    item: {type: DraggableType.DraggableOwnCard},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  if (isDragging){
    onDrag(index);
  }

  

  return (  
    <img src={require ('./img/BackRect125.png')} ref={drag} onDoubleClick={onDoubleClick}
      style={{
        opacity: isDragging ? 0.1 : 1,
        cursor: 'move',
        transform: `rotate(${card['flipped']? '180' : '0'}deg)`,
        padding: '5px',
        border: card['is_informed'] ? '4px solid blue' : 'none'
      }}/>
  );

}

OwnCard.propTypes = {
  index: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  card: PropTypes.object.isRequired,
};

function OwnSlot(props) {
  const {slotIndex, onDrag, draggedIndex, card} = props;
  const userId = useContext(UserIdContext);

  const [{ isOver }, drop] = useDrop({
    accept: DraggableType.DraggableOwnCard,
    drop: () => {
      moveCard(draggedIndex, slotIndex);
    },
    canDrop: () => draggedIndex != slotIndex,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const moveCard = (indexFrom, indexTo) => {
    axios.post( `/move_card/${userId}`, 
      {'move_from_index': indexFrom, 'move_to_index': indexTo}
    );
  };

  return (  
    <span 
      ref={drop}
      style={{
        opacity: isOver ? 0.5 : 1,
        cursor: 'move',}}
    >
      <OwnCard index={slotIndex} onDrag={onDrag} onDoubleClick={() => moveCard(slotIndex, slotIndex)} card={card}/>
    </span>
  );

}

OwnSlot.propTypes = {
  slotIndex: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  draggedIndex: PropTypes.number.isRequired,
  card: PropTypes.object.isRequired,
};

export function OwnHand(props) {
  const {cards, setDraggedIndex, draggedIndex} = props;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row-reverse'
    }}> 
      {cards.map((card, index) =>
        <OwnSlot
          slotIndex={index}
          key={'slot' + index}
          onDrag={setDraggedIndex}
          draggedIndex={draggedIndex} 
          card={cards[index]}
        />)}
    </div>
  );
}

OwnHand.propTypes = {
  cards: PropTypes.array.isRequired,
  setDraggedIndex: PropTypes.func.isRequired,
  draggedIndex: PropTypes.number.isRequired,
};

function PlayerCards(props) {
  const {cards, onClick} = props;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row-reverse'
    }}> 
      {cards.map((card, index) =>
        <img
          src={cardToImageFile(card['number'], card['color'])}
          key={index} 
          onClick={() => onClick(index)}
          style={{
            padding: '5px',
            transform: `rotate(${card['flipped']? '180' : '0'}deg)`,
            border: card['is_informed'] ? '4px solid blue' : 'none',
          }}
        />)}
    </div>
  );
}

PlayerCards.propTypes = {
  cards: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};


function Player(props) {
  const { displayName, cards, onClick} = props;
  
  return (
    <div>
      {displayName} hand: <br/>
      <PlayerCards cards={cards} onClick={onClick}/>
    </div>
  );

}

Player.propTypes = {
  displayName: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Player;