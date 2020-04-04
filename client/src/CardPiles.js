import React from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile, CARD_WIDTH} from './Cards.js';

function RemainingDeck(props) {
  const {remainingCards} = props;

  return (
    <div style={{width: CARD_WIDTH + 'px'}}>
      Remaining Deck: <br/>
      <img src={require ('./img/BackRect125.png')} style={{width: '100%'}}/>
      <div style={{position: 'relative', top: '-30px', marginTop: '-60px', textAlign: 'center', fontFamily: 'Frijole', fontSize: '40px', 
        color: 'white', textShadow:'-2px 0 black, 0 2px black, 2px 0 black, 0 -2px black'}}>{remainingCards}</div>
    </div>
  );
}

RemainingDeck.propTypes = {
  remainingCards: PropTypes.number.isRequired,
};

export function HanabiTable(props) {
  const {table} = props;

  const renderCards = (color, maxCardNumber) => {
    let outCards = [];
    for (let index = 1; index <= maxCardNumber; index++) {
      let cardPath = cardToImageFile(index, color);
      outCards.push(<img src={cardPath} key={'card_' + color + index}/>);
    }
    return <div key={'cardDiv' + color}>{outCards}</div>;
  };

  const generateBoard = () => {
    let outBoards = [];
    let colors = Object.keys(table); 

    for (let index = 0; index < colors.length; index++) {
      let currColor = colors[index];
      //table[currColor] = 2; // Just for testing
      let currColorOnBoard = table[currColor];
      let style = {color: currColor};
      if (currColor == 'white') {
        style['backgroundColor'] = 'black';
        style['alignItems'] = 'start';
      }
      outBoards.push(<tr key={'tr_' + index}>
        <td key={'td1_' + index}> <h3 style={style} key={'h3_' + index}>{currColor}</h3> </td>
        <td key={'td2_' + index}> {renderCards(currColor, currColorOnBoard)} </td>
      </tr>);
    }

    return <table key='table'>{outBoards}</table>;
  };

  return (
    <div>
      <h2>Hanabi Board</h2>
      {generateBoard()}
    </div>
  );
}

HanabiTable.propTypes = {
  table: PropTypes.object.isRequired,
};
  
export default RemainingDeck;