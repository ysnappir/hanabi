import React from 'react';
import PropTypes from 'prop-types';

const Error = ({ touched, message }) => {
  if (!touched) {
    return <div className="form-message invalid">&nbsp;</div>;
  }
  if (message) {
    return <div className="form-message invalid">{message}</div>;
  }
  return <div className="form-message valid">all good</div>;
};
  
Error.propTypes = {
  touched: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};
  