import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {UserIdContext} from './Contex.js';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';
import IconButton from '@material-ui/core/IconButton';
import UndoIcon from '@material-ui/icons/Undo';
import './App.css';
import {HanabiCard} from './Card.js';


export const DraggableType = {
  DraggableOwnCard: 'OwnCard',
};

function OwnCard(props) {
  const {index, onDrag, onDoubleClick, card, tubinMode} = props;

  const [{ isDragging }, drag] = useDrag({
    item: {type: DraggableType.DraggableOwnCard},
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  if (isDragging){
    onDrag(index);
  }

  console.log('tubin: ' + tubinMode);

  return (  
    <>
      <div 
        className="card_container"
        style={{
          opacity: isDragging ? 0.1 : 1,
          cursor: 'move',
        }}
        ref={drag} 
        onDoubleClick={onDoubleClick}
      >
        <HanabiCard card={card} tubinMode={tubinMode}/>
      </div>
    </>
  );

}

OwnCard.propTypes = {
  index: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  card: PropTypes.object.isRequired,
  tubinMode: PropTypes.bool.isRequired,
};

function OwnSlot(props) {
  const {slotIndex, onDrag, draggedIndex, card, tubinMode} = props;
  const userId = useContext(UserIdContext);

  const [{ isOver }, drop] = useDrop({
    accept: DraggableType.DraggableOwnCard,
    drop: () => {
      moveCard(draggedIndex, slotIndex);
    },
    canDrop: () => draggedIndex !== slotIndex,
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
      <OwnCard 
        index={slotIndex} 
        onDrag={onDrag} 
        onDoubleClick={() => moveCard(slotIndex, slotIndex)} 
        card={card}
        tubinMode={tubinMode}
      />
    </span>
  );

}

OwnSlot.propTypes = {
  slotIndex: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  draggedIndex: PropTypes.number,
  card: PropTypes.object.isRequired,
  tubinMode: PropTypes.bool.isRequired,
};

export function OwnHand(props) {
  const {cards, setDraggedIndex, draggedIndex, reportUndoCardMotion, tubinMode} = props;

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
          tubinMode={tubinMode}
        />)}
      <IconButton onClick={reportUndoCardMotion}><UndoIcon/></IconButton>
    </div>
  );
}

OwnHand.propTypes = {
  cards: PropTypes.array.isRequired,
  setDraggedIndex: PropTypes.func.isRequired,
  draggedIndex: PropTypes.number,
  reportUndoCardMotion: PropTypes.func.isRequired,
  tubinMode: PropTypes.bool.isRequired,
};

function PlayerCards(props) {
  const {cards, onClick, tubinMode} = props;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row-reverse'
    }}> 
      {cards.map((card, index) =>
        <>
          <div onClick={() => onClick(index)}>
            <HanabiCard card={card} tubinMode={tubinMode}/>
          </div>
        </>
      )}
    </div>
  );
}

PlayerCards.propTypes = {
  cards: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  tubinMode: PropTypes.bool.isRequired,
};


function Player(props) {
  const { displayName, cards, onClick, tubinMode} = props;
  
  return (
    <div>
      {displayName} hand: <br/>
      <PlayerCards cards={cards} onClick={onClick} tubinMode={tubinMode}/>
    </div>
  );

}

Player.propTypes = {
  displayName: PropTypes.string.isRequired,
  cards: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  tubinMode: PropTypes.bool.isRequired,
};

export default Player;