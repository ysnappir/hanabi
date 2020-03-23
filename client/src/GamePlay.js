import React, { Component } from 'react'
import axios from 'axios'
import FullTokenPile from './Tokens.js'


class GamePlay extends Component {
    constructor (props) {
        super(props)
      }

    render () {
        return (
        <div>
            Full game play <br/> <br/>
            Tokens Status: <br/>
            <FullTokenPile/>
        </div>
        )
    }
}
export default GamePlay