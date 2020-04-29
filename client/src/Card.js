import React from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import './App.css';


const cardToText = (card) => {
  const kvToToken = (key, value) => {
    return (
      <>
        <p className="card_text_props" style={{'color': (value ? 'green' : 'red')}}>
          {key}
        </p>
      </>
    );
  };
    
  let propList = [
    ...Object.keys(card['informed_numbers']).map((number) => kvToToken(number.toString(), card['informed_numbers'][number])),
    ...Object.keys(card['informed_colors']).map((color) => kvToToken(color, card['informed_colors'][color]))
  ];
  return (
    <>
      {propList.reduce((prev, curr) => [prev, curr], '')}
    </>
  );
};

export function HanabiCard(props) {
  const {card, tubinMode} = props;

  return (  
    <>
      <div className="card_container">
        <img src={cardToImageFile(card['number'], card['color'])} alt=''
          style={{
            transform: `rotate(${card['flipped']? '180' : '0'}deg)`,
            padding: '5px',
            border: card['highlighted'] ? '4px solid blue' : 'none'
          }}/>
        <div className="centered">
          {tubinMode && cardToText(card)}
        </div>
      </div>
    </>
  );
}

HanabiCard.propTypes = {
  card: PropTypes.object.isRequired,
  tubinMode: PropTypes.bool
};

HanabiCard.defaultProps = {
  tubinMode: false,
};
