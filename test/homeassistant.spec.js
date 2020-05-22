import rewiremock from 'rewiremock';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';

chai.should();
chai.use(sinonChai);

const testConfig = {
    "serverUrl": "https://your-server.homeassistant.org",
    "token": "long-lived-access-token-from-user-profile-page",
    "publishFrequencyInSeconds": 60
}

let homeassistantRewired;

describe('homeassistant', function() {

    this.beforeEach(() => {
        homeassistantRewired = rewiremock.proxy('../homeassistant', () => ({
            'config': {
                config: testConfig
            }
        }));
    })

    it('should error on publish with no SensorId value', function() {

        expect(() => {
            homeassistantRewired.publish();
        }).to.throw().with.property('message', 'Sensorid is required');

    });

    it('should error on publish with no value', function() {

        expect(() => {
            homeassistantRewired.publish('SomeSensorId');
        }).to.throw().with.property('message', 'Value is required and must be a number');

    });

    it('should error on publish with invalid value', function() {

        expect(() => {
            homeassistantRewired.publish('SomeSensorId', 'string');
        }).to.throw().with.property('message', 'Value is required and must be a number');

    });

    it('should publish with valid parameters', function() {

        const fakeAxios = sinon.fake(() => {
            return { then: () => { return { catch: () => {} }} }
        });

        homeassistantRewired = rewiremock.proxy('../homeassistant', () => ({
            'axios': fakeAxios,
            'config': {
                config: testConfig
            }
        }));

        expect(() => {
            homeassistantRewired.publish('SomeSensorId', 12.123);
        }).to.not.throw();

        expect(fakeAxios.called).to.be.true;

        const args = fakeAxios.lastArg;
        expect(args.url).to.equal('https://your-server.homeassistant.org/api/states/sensor.onewireSomeSensorId');
        expect(args.method).to.equal('post');
        expect(args.headers.Authorization).to.equal('Bearer long-lived-access-token-from-user-profile-page');
        expect(args.headers['Content-Type']).to.equal('application/json');
        expect(args.data.state).to.equal(12.123);
        expect(args.data.attributes.icon).to.equal('mdi:temperature-celsius');
        expect(args.data.attributes.unit_of_measurement).to.equal('°C');

    });
});