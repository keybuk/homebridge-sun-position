var inherits = require('util').inherits,
	suncalc = require('suncalc');

let SERVICE_UUID  = 'a8330e43-f6f4-4a7f-80ae-6b2915cc4569';
let ALTITUDE_UUID = 'a8af30e7-5c8e-43bf-bb21-3c1343229260';
let AZIMUTH_UUID  = 'ace1dd10-2e46-4100-a74a-cc77f13f1bab';

let UpdatePeriod = 60000;

module.exports = function(homebridge) {
	Accessory = homebridge.hap.Accessory;
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;

	homebridge.registerAccessory('homebridge-sun-position', 'SunPosition', SunPositionAccessory);

	AltitudeCharacteristic = function() {
		Characteristic.call(this, 'Altitude', ALTITUDE_UUID);

		this.setProps({
	    	format: Characteristic.Formats.FLOAT,
	    	unit: Characteristic.Units.ARC_DEGREE,
	    	minValue: -90,
	    	maxValue: 90,
	    	minStep: 0.1,
	    	perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
	    });
		this.value = this.getDefaultValue();
	}
	inherits(AltitudeCharacteristic, Characteristic);

	AzimuthCharacteristic = function() {
		Characteristic.call(this, 'Azimuth', AZIMUTH_UUID);

		this.setProps({
	    	format: Characteristic.Formats.FLOAT,
	    	unit: Characteristic.Units.ARC_DEGREE,
	    	minValue: 0,
	    	maxValue: 360,
	    	minStep: 0.1,
	    	perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
	    });
		this.value = this.getDefaultValue();
	}
	inherits(AzimuthCharacteristic, Characteristic);
}


function SunPositionAccessory(log, config) {
	this.log = log;
	this.config = config;
	this.name = config.name;

	if (!config.location || !Number.isFinite(config.location.lat) || !Number.isFinite(config.location.long))
		throw new Error("Missing or invalid location configuration");

	this.location = config.location;
}

SunPositionAccessory.prototype.identify = function(callback) {
	this.log("Identify");
	callback();
}

SunPositionAccessory.prototype.getServices = function() {
	this.informationService = new Service.AccessoryInformation();
	this.informationService
		.setCharacteristic(Characteristic.Manufacturer, "github.com keybuk")
		.setCharacteristic(Characteristic.Model, "Sun Position")
		.setCharacteristic(Characteristic.SerialNumber, "");

    this.service = new Service("Sun Position", SERVICE_UUID);
    this.service.addCharacteristic(AltitudeCharacteristic);
    this.service.addCharacteristic(AzimuthCharacteristic);

    this.updatePosition();

    return [this.service];
}

SunPositionAccessory.prototype.updatePosition = function() {
	var now = new Date();
	var position = suncalc.getPosition(now, this.location.lat, this.location.long);
	var altitude = position.altitude * 180 / Math.PI;
	var azimuth = (position.azimuth * 180 / Math.PI + 180) % 360;

	this.log("Sun is " + altitude + " high at " + azimuth);

	this.service.setCharacteristic(AltitudeCharacteristic, altitude);
	this.service.setCharacteristic(AzimuthCharacteristic, azimuth);

	setTimeout(this.updatePosition.bind(this), UpdatePeriod);
}