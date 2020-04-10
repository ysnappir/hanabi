import React, { useState } from 'react';
import './App.css';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Options from './Options';
import {UserIdContext} from './Contex.js';
import GamePlay from './GamePlay';
import Error from './Error';


const ValidationSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Too Short! Come on - Give it at least two chars!')
    .max(255, 'Too Long!')
    .required('Required'),
  numOfColors: Yup.number()
    .positive('You\'ve Got To Be Wearing At Least One Color! (And make the number positive)')
    .required('Required')
});


function App() {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [pinCode, setPinCode] = useState(undefined);

  const handleLoginError = (reason) => {
    alert('Sorry! Error is ' + reason);
  };

  const handleLoginResponse = (response) => {
    setUserId(response.data.id);
    setLoginSuccess(true);
  };

  const onDisplayGame = (pinCode) => {
    setPinCode(pinCode);
  };

  if (loginSuccess || pinCode) {
    return (
      <UserIdContext.Provider value={userId}>
        <div>
          { pinCode ? <GamePlay gameId={pinCode} /> : <Options onDisplayGame={onDisplayGame}/> }
        </div>
      </UserIdContext.Provider>
    );
  }

  return (
    <Formik
      initialValues={{displayName: '', numOfColors: ''}}
      validationSchema={ValidationSchema}

      onSubmit = {async (values, { setSubmitting }) => {
        setSubmitting(true);
        
        try {
          const response = await axios.post('/register', { display_name: values.displayName, 
            number_of_colors_in_clothes: values.numOfColors});
          handleLoginResponse(response);
        } catch (error) {
          handleLoginError(error);
        }

        setSubmitting(false);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit} className='main__container'>
          <div className='input-row'>
            <label>Display Name: </label>
            <input
              type='text'
              name='displayName'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.displayName}
              className={touched.displayName && errors.displayName ? 'has-error' : null}
            />
            <Error touched={touched.displayName} message={errors.displayName} />
          </div>

          <div className='input-row'>
            <label>How many colors are you wearing: </label>
            <input
              type='text'
              name='numOfColors'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.numOfColors}
              className={touched.numOfColors && errors.numOfColors ? 'has-error' : null}
            />
            <Error touched={touched.numOfColors} message={errors.numOfColors} />
          </div>

          <div className='input-row'>
            <button type='submit' disabled={isSubmitting}>Let&apos;s GO!</button>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default App;
