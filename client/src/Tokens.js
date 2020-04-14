import React from 'react';
import clue_token from './img/clue.png';
import miss_token from './img/miss.png';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography } from '@material-ui/core';


const TOKENS_ARR = { 'clue' : clue_token, 'miss' : miss_token };

export const MAX_CLUE_TOKENS = '8';
export const MAX_MISS_TOKENS = '3';

const useStyles = makeStyles((theme, index) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  token: {
    height: '30px',
    //position: 'relative',
    //left: '-20px',
    //marginRight: '-50%'
  }
}));


function SingleTokenPile(props) {
  const classes = useStyles();
  const {clueTokens, missTokens} = props;

  const draw_tokens = (token_type, num_of_tokens) => {
    const out_tokens = [];
    for (let index = 0; index < num_of_tokens; index++) {
      var uniq_key = token_type + index;
      //let left = index * (-20) + 'px';
      //style={{left: left}}
      out_tokens.push(<img className={classes.token} src={TOKENS_ARR[token_type]} alt="" key={uniq_key}/>);
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
  const classes = useStyles();

  const {clueTokens, missTokens} = props;

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h4">
              Tokens Status:
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Typography variant="h5">
            Available Tokens:
            </Typography>
            <SingleTokenPile clueTokens={clueTokens} missTokens={missTokens}/>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Typography variant="h5">
              Used Tokens:
            </Typography>
            <SingleTokenPile clueTokens={MAX_CLUE_TOKENS - clueTokens} missTokens={MAX_MISS_TOKENS - missTokens}/>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );  
}

FullTokenPile.propTypes = {
  clueTokens: PropTypes.number.isRequired,
  missTokens: PropTypes.number.isRequired,
};

export default FullTokenPile;