import React from 'react';
import PropTypes from 'prop-types';

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
    console.log(table);
    console.log(table.length);
    console.log(table['green']);
    
    for (let index = 0; index < table.length; index++) {
      console.log('loop');
      //outBoards.push(<h3 style={{}}></h3>);
      //let cardPath = cardToImageFile(cards[index]['number'], cards[index]['color']);
      //outBoards.push(<img src={cardPath} key={index}/>);
    }
    
    return <div>{outBoards}</div>;

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