var suncalc = require('suncalc');

let SERVICE_UUID  = 'a8330e43-f6f4-4a7f-80ae-6b2915cc4569';
let ALTITUDE_UUID = 'a8af30e7-5c8e-43bf-bb21-3c1343229260';
let AZIMUTH_UUID  = 'ace1dd10-2e46-4100-a74a-cc77f13f1bab';

let UpdatePeriod = 60000;

module.exports = function(homebridge) {
	Accessory = homebridge.hap.Accessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	UUIDGen = homebridge.hap.uuid;

	homebridge.registerAccessory('homebridge-sun-position', 'SunPosition', SunPositionAccessory);
}

function SunPositionAccessory(log, config) {
	this.log = log;
	this.config = config;
	this.name = config.name;

	if (!config.location || !Number.isFinite(config.location.lat) || !Number.isFinite(config.location.long))
		throw new Error("Missing or invalid location configuration");

	this.location = config.location;
}

SunPositionAccessory.prototype.getServices = function() {
    this.service = new Service("Sun Position", SERVICE_UUID);

    this.service.addCharacteristic(new Characteristic("Altitude", ALTITUDE_UUID))
    	.setProps({
    		format: Characteristic.Formats.FLOAT,
    		unit: Characteristic.Units.ARC_DEGREE,
    		minValue: -90,
    		maxValue: 90,
    		minStep: 0.1,
    		perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    	});

    this.service.addCharacteristic(new Characteristic("Azimuth", AZIMUTH_UUID))
    	.setProps({
    		format: Characteristic.Formats.FLOAT,
    		unit: Characteristic.Units.ARC_DEGREE,
    		minValue: 0,
    		maxValue: 360,
    		minStep: 0.1,
    		perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
    	});

    this.updatePosition();

    return [this.service];
}

SunPositionAccessory.prototype.updatePosition = function() {
	var now = new Date();
	var position = suncalc.getPosition(now, this.location.lat, this.location.long);
	var altitude = position.altitude * 180 / Math.PI;
	var azimuth = (position.azimuth * 180 / Math.PI + 180) % 360;

	this.log("Sun is " + altitude + " high at " + azimuth);

	this.service.setCharacteristic("Altitude", altitude);
	this.service.setCharacteristic("Azimuth", azimuth);

	setTimeout(this.updatePosition.bind(this), UpdatePeriod);
}