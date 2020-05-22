const axios = require('axios');
const { config } = require('./config');
const { log } = require('./logger');

module.exports = {
    publish: publish
}

function publish(sensorId, value) {
    if (typeof sensorId === 'undefined') {
        throw new Error('Sensorid is required');
    } else if (typeof value === 'undefined' || isNaN(parseFloat(value))) {
        throw new Error('Value is required and must be a number');
    }

    log(`Publish '${sensorId}' with value '${value}'`, true);
    
    axios({
        url: `${config.serverUrl}/api/states/sensor.onewire${sensorId}`,
        method: 'post',
        headers: { 'Authorization': `Bearer ${config.token}`,
                    'Content-Type': 'application/json' },
        data: { state: value, 
                attributes: 
                {   icon: 'mdi:temperature-celsius', 
                    unit_of_measurement: '°C'
                }
            },
        }
    ).then(() => {
        log('Published', true);
    }).catch((e) => {
        console.error(e);
    });
}
