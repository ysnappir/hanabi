import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile, CARD_WIDTH} from './Cards.js';
import { useDrop } from 'react-dnd';

import { Typography } from '@material-ui/core';


function RemainingDeck(props) {

  const {remainingCards} = props;

  return (
    <div style={{width: CARD_WIDTH + 'px'}}>
      <Typography variant="h6" align='center'>
        Remaining Deck:
      </Typography>
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
  const {table, placeActionFunc, isMyTurn} = props;


  const [{ isOver }, drop] = useDrop({
    accept: 'OwnCard',  // DraggableType['DraggableOwnCard'], // 
    drop: () => {
      placeActionFunc();
    },
    canDrop: () => isMyTurn,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  const renderCards = (color, card) => {
    if(card['number'] !== null)
      return <img src={cardToImageFile(card['number'], color)} key={color} alt='' style={{border: card['highlighted'] ? '4px solid blue' : 'none'}}/>;
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
  placeActionFunc: PropTypes.func.isRequired,
  isMyTurn: PropTypes.bool.isRequired,
};

export function BurntPile(props) {
  const {cardList, reportBurnAction, isMyTurn} = props;

  const [{ isOver }, drop] = useDrop({
    accept: 'OwnCard',
    drop: () => {
      reportBurnAction();
    },
    canDrop: () => isMyTurn,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
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
                .map((card, counter) => <img src={cardToImageFile(card['number'], card['color'])} 
                  key={'burntCard_' + index + '_ś' + counter} alt='' style={{border: card['highlighted'] ? '4px solid blue' : 'none'}}/>)
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
  reportBurnAction: PropTypes.func.isRequired,
  isMyTurn: PropTypes.bool.isRequired,
};

export default RemainingDeck;