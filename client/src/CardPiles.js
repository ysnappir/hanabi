import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile, CARD_WIDTH} from './Cards.js';
import { useDrop } from 'react-dnd';
import axios from 'axios';
import {UserIdContext} from './Contex.js';

function RemainingDeck(props) {
  const {remainingCards} = props;

  return (
    <div style={{width: CARD_WIDTH + 'px'}}>
      Remaining Deck: <br/>
      <img src={require ('./img/BackRect125.png')} style={{width: '100%'}} alt=''/>
      <div style={{position: 'relative', top: '-30px', marginTop: '-60px', textAlign: 'center', fontFamily: 'Frijole', fontSize: '40px', 
        color: 'white', textShadow:'-2px 0 black, 0 2px black, 2px 0 black, 0 -2px black'}}>{remainingCards}</div>
    </div>
  );
}

RemainingDeck.propTypes = {
  remainingCards: PropTypes.number.isRequired,
};

export function HanabiTable(props) {
  const {table, droppedCardIndex, isMyTurn} = props;
  const userId = useContext(UserIdContext);

  const [{ isOver }, drop] = useDrop({
    accept: 'OwnCard',  // DraggableType['DraggableOwnCard'], // 
    drop: () => {
      placeActionFunc(userId, droppedCardIndex);
    },
    canDrop: () => isMyTurn,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  async function placeActionFunc(userId, cardIndex) {
    try {
      await axios.post('/make_turn/place/' + userId, {'card_index': cardIndex});  // const response = 
    }
    catch(error) {
      console.log('Error placing card ' + error);
    }
  }
  
  const renderCards = (color, maxCardNumber) => {
    // console.log('Rendering ' + color + '. Number: ' + maxCardNumber);
    if(maxCardNumber > 0)
      return <img src={cardToImageFile(maxCardNumber, color)} key={color} alt=''/>;
    else
      return <svg key={color} width="50" height="125"><rect width="40" height="100" fill={color === 'rainbow'? 'black' : color}/></svg>;
  };

  return (
    <div ref={drop} style={{background: (isOver && isMyTurn)? 'lightblue' : 'white',}}>  
      <h2>Hanabi Board</h2>
      {Object.keys(table).map((color) => renderCards(color, table[color]))}
    </div>
  );
}

HanabiTable.propTypes = {
  table: PropTypes.object.isRequired,
  droppedCardIndex: PropTypes.number,
  isMyTurn: PropTypes.bool.isRequired,
};

export function BurntPile(props) {
  const {cardList, droppedCardIndex, isMyTurn} = props;
  const userId = useContext(UserIdContext);

  const [{ isOver }, drop] = useDrop({
    accept: 'OwnCard',
    drop: () => {
      burnActionFunc(userId, droppedCardIndex);
    },
    canDrop: () => isMyTurn,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  async function burnActionFunc(userId, cardIndex) {
    try {
      console.log('burning card ' + cardIndex);
      await axios.post('/make_turn/burn/' + userId, {'card_index': cardIndex});
    }
    catch(error) {
      console.log('Error burning card ' + error);
    }
  }
  
  const renderCardsByNumberSortedByColor = () => {
    let numbers = [1, 2, 3, 4, 5];
    return (
      <div ref={drop} style={{background: (isOver && isMyTurn)? '#F98A91' : 'white',}}>  
        <h2>Burnt pile. length: {cardList.length}</h2>
        {
          numbers
            .map((value, index) => <div key={value}>
              {cardList.filter(item => item['number'] === value)
                .sort((x, y) => {
                  if(x['color'] > y['color'])
                    return 1;
                  else
                    return -1;
                })
                .map((value, counter) => <img src={cardToImageFile(value['number'], value['color'])} 
                  key={'burntCard_' + index + '_ś' + counter} alt=''/>)
              }
            </div>)
        }
      </div>
    );  
  };
  
  return renderCardsByNumberSortedByColor();
}

BurntPile.propTypes = {
  cardList: PropTypes.array.isRequired,
  droppedCardIndex: PropTypes.number,
  isMyTurn: PropTypes.bool.isRequired,
};

export default RemainingDeck;