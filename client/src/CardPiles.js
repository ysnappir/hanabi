import React from 'react';
import PropTypes from 'prop-types';
import {COLOR_TO_FILE_INDENTIFIER, cardToImageFile} from './Cards.js';

function RemainingDeck(props) {
  const {remainingCards} = props;

  return (
    <div style={{width: '81px'}}>
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

  const generateBoard = () => {
    let outBoards = [];
    let colors = Object.keys(table); 

    for (let index = 0; index < colors.length; index++) {
      let currColor = colors[index];
      let currColorOnBoard = table[currColor];
      let style = {color: currColor};
      if (currColor == 'white') {
        style['backgroundColor'] = 'black';
        style['alignItems'] = 'start';
      }
      outBoards.push(<tr>
        <td> <h3 style={style}>{currColor}</h3> </td>
        <td> </td>
      </tr>);
    }

    return <table>{outBoards}</table>;
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