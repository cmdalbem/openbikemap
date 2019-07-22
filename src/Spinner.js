import React, { Component } from 'react';

import './Spinner.css'

class Spinner extends Component {
    render() {
        const parts = this.props.area.split(',');
        const city = parts[0],
            state = parts[1],
            country = parts[2];

        return (
            <div id="spinner" className="loader-container">
                <div className="loader">
                    <svg className="spinnersvg" viewBox='25 25 50 50'>
                        <circle className="path" cx='50' cy='50' r='20' fill='none' strokeWidth='6' strokeMiterlimit='10'
                        />
                    </svg>

                    <div className="content">
                        <h2>
                            Carregando mapa cicloviário de <b>{city}</b>.
                        </h2>

                        <div>
                            Como é a primeira vez que você carrega esta cidade pode demorar um pouquinho :)
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default Spinner;