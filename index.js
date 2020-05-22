const homeassistant = require('./homeassistant');
const onewire = require('ds18b20');
const { config } = require('./config');
const { log } = require('./logger');

let sensorIds = [];

async function init(){
    if (!config.loadError) {    
        sensorIds = await findSensors();

        if (sensorIds.length > 0) {
            setInterval(getTemperatures, config.publishFrequencyInSeconds * 1000);
        }
    }
}

function publishTemperature(sensorId, value) {
    if (sensorId && !isNaN(value)){
        homeassistant.publish(sensorId, value);
    }
}

async function findSensors() {
    return new Promise((resolve, _) => {
        log('Searching for OneWire sensors...');
        
        onewire.sensors(function(err, ids) {
            if(err) {
                console.error(err);
                resolve([]);
            } else if (ids) {
                log(`Sensors found. Publishing sensor id's:`)
                ids.forEach((id)=> {
                    log(`${id}`);
                });
                resolve(ids);
            } else {
                log('No sensors found');
                resolve([]);    
            }
        });
    });
    
}

function getTemperatures() {
    sensorIds.map((id) => {
        log(`Getting temperature for ${id}`, true);
        onewire.temperature(id, {}, (err, data) => {
           if (!err && data) {
            publishTemperature(id, data);
           }
        });
    });
}

init();
