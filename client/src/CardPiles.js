import React from 'react';
import PropTypes from 'prop-types';
import {CARD_WIDTH, CARD_HEIGHT} from './Cards.js';
import { useDrop } from 'react-dnd';
import {HanabiCard} from './Card.js';
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
    accept: 'OwnCard', 
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
      return <HanabiCard card={card}/>;
    else
      return <svg key={color} width={CARD_WIDTH} height={CARD_HEIGHT}><rect width={CARD_WIDTH} height={CARD_HEIGHT} fill={color === 'rainbow'? 'black' : color}/></svg>;
  };


  let colorPiles = Object.keys(table).map((color) => renderCards(color, table[color]));
  let splitIndex = colorPiles.length / 2;

  return (
    <>
      <h2>Hanabi Board</h2>
      <div ref={drop} 
        style={{
          background: (isOver && isMyTurn)? 'lightblue' : 'white',
          height: CARD_HEIGHT * 2.2,
          width: 4 * CARD_WIDTH,
        }}>  
        {colorPiles.slice(0, splitIndex)}
        <br/>
        {colorPiles.slice(splitIndex)}
      </div>
    </>
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

    let numberPile = null;

    const numberBurntPile = (value, index) => {
      if (!cardList.map((item) => item['number']).includes(value)){
        numberPile = (
          <svg key={value} width={CARD_WIDTH} height={2 * CARD_HEIGHT} >
            <rect width={CARD_WIDTH} height={2 * CARD_HEIGHT} fillOpacity={0}/>
          </svg>
        );
      }
      else{
        numberPile = cardList.filter(item => item['number'] === value)
          .sort((x, y) => {
            if(x['color'] > y['color'])
              return 1;
            else
              return -1;
          })
          .map((card, counter) => 
            <div 
              key={'burntCard_' + index + '_' + counter}
              style={{
                position: 'absolute',
                top: counter * CARD_HEIGHT / 4,
              }}
            >
              <HanabiCard card={card}/>
            </div>
          );
      }

      return (
        <>
          <div 
            key={value} 
            style={{
              position: 'absolute',
              left: (value - 1) * CARD_WIDTH,
            }}>
            {numberPile}
          </div>
        </>
      );

    };

    return (
      <>
        <center><h2>Burnt pile. length: {cardList.length}</h2></center>
        <div style={{          
          position: 'relative',
          top: 0,
          backgroundColor: (isOver && isMyTurn)? '#F98A91' : 'white',
          // borderStyle: 'double',
          height: 2 * CARD_HEIGHT,
          width: 5 * CARD_WIDTH,
        }}
        ref={drop}
        >
          {
            numbers
              .map((value, index) => numberBurntPile(value, index,))
          }
        </div>
      </>
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