import React from 'react';
import clue_token from './img/clue.png';
import miss_token from './img/miss.png';
import PropTypes from 'prop-types';

const TOKENS_ARR = { 'clue' : clue_token, 'miss' : miss_token };

export const MAX_CLUE_TOKENS = '8';
export const MAX_MISS_TOKENS = '3';


function SingleTokenPile(props) {
  const {clueTokens, missTokens} = props;

  const draw_tokens = (token_type, num_of_tokens) => {
    const out_tokens = [];
    for (let index = 0; index < num_of_tokens; index++) {
      var uniq_key = token_type + index;
      out_tokens.push(<img src={TOKENS_ARR[token_type]} alt="" key={uniq_key}/>);
    }
    return out_tokens;
  };
    
  return (
    <div>
        Clue Tokens: {draw_tokens('clue', clueTokens)}<br/> <br/>
        Miss Tokens: {draw_tokens('miss', missTokens)}
    </div>
  );
}

SingleTokenPile.propTypes = {
  clueTokens: PropTypes.number.isRequired,
  missTokens: PropTypes.number.isRequired,
};


function FullTokenPile(props) {
  const {clueTokens, missTokens} = props;

  return (
    <div>
        Available Tokens: <SingleTokenPile clueTokens={clueTokens} missTokens={missTokens}/> <br/><br/>
        Used Tokens: <SingleTokenPile clueTokens={MAX_CLUE_TOKENS - clueTokens} missTokens={MAX_MISS_TOKENS - missTokens}/> <br/><br/>
    </div>
  );  
}

FullTokenPile.propTypes = {
  clueTokens: PropTypes.number.isRequired,
  missTokens: PropTypes.number.isRequired,
};

export default FullTokenPile;