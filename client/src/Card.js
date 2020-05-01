import React from 'react';
import PropTypes from 'prop-types';
import {cardToImageFile} from './Cards.js';
import './App.css';
import tubinModes from './Enums';


const cardToText = (card, tubinMode) => {
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
    ...Object.keys(card['informed_numbers']).map((number) => [number.toString(), card['informed_numbers'][number]]),
    ...Object.keys(card['informed_colors']).map((color) => [color, card['informed_colors'][color]])
  ];

  return (
    <>
      {propList
        .filter((arr) => tubinModes[tubinMode].TYPE !== 'LIGHT' || arr[1])
        .map((arr) => kvToToken(arr[0], arr[1]))
        .reduce((prev, curr) => [prev, curr], '')}
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
          {tubinModes[tubinMode].TYPE !== 'NONE' && cardToText(card, tubinMode)}
        </div>
      </div>
    </>
  );
}

HanabiCard.propTypes = {
  card: PropTypes.object.isRequired,
  tubinMode: PropTypes.number
};

HanabiCard.defaultProps = {
  tubinMode: 0,
};
