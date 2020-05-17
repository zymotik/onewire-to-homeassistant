import rewiremock from 'rewiremock';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';

const path = require('path');

chai.should();
chai.use(sinonChai);

describe('settings', function() {
    it('should load settings', function() {
        const settingsJson = `{
            "serverUrl": "https://192.168.0.1",
            "publishFrequencyInSeconds": 60,
            "token": "bearertoken",
            "debug": false
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith(path.join(__dirname, '../settings.json'));
        expect(configRewired.config.serverUrl).to.equal('https://192.168.0.1');
        expect(configRewired.config.publishFrequencyInSeconds).to.equal(60)
        expect(configRewired.config.token).to.equal('bearertoken')
        expect(configRewired.config.debug).to.equal(false);
    });

    it('should load enable logging', function() {
        const settingsJson = `{
            "debug": true
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith(path.join(__dirname, '../settings.json'));
        expect(configRewired.config.debug).to.equal(true);
    });

    it('should error when no settings found', function() {
        const fsMock = { readFileSync: sinon.fake(() => { throw { code: 'ENOENT' }; }) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        expect(configRewired.config.loadError).to.equal(true);
    });

});
