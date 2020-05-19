var inherits = require('util').inherits,
	suncalc = require('suncalc');

let ALTITUDE_UUID = 'a8af30e7-5c8e-43bf-bb21-3c1343229260';
let AZIMUTH_UUID  = 'ace1dd10-2e46-4100-a74a-cc77f13f1bab';

let UpdatePeriod = 5;
let AltitudeStep = 0.1;
let AzimuthStep = 0.1;

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
	    	minStep: AltitudeStep,
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
	    	minStep: AzimuthStep,
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
	this.updatePeriod = config.updatePeriod || UpdatePeriod;
	this.altitudeStep = config.altitudeStep || AltitudeStep;
	this.azimuthStep = config.azimuthStep || AzimuthStep;
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

    this.service = new Service.LightSensor("Sun");
    this.service.addCharacteristic(AltitudeCharacteristic);
	this.service.addCharacteristic(AzimuthCharacteristic);
	
	this.service.getCharacteristic(AltitudeCharacteristic).props.minStep = this.altitudeStep;
	this.service.getCharacteristic(AzimuthCharacteristic).props.minStep = this.azimuthStep;

    this.updatePosition();

    return [this.informationService, this.service];
}

SunPositionAccessory.prototype.updatePosition = function() {
	var now = new Date();
	var times = suncalc.getTimes(now, this.location.lat, this.location.long);

	// Arbitrary lux values for times.
	var lux = 0;
	if (now >= times.sunrise && now <= times.sunriseEnd) {
		lux = 400;
	} else if (now > times.sunriseEnd && now <= times.goldenHourEnd) {
		lux = 20000;
	} else if (now >= times.goldenHour && times < times.sunsetStart) {
		lux = 20000;
	} else if (now >= times.sunsetStart && now <= times.sunset) {
		lux = 400;
	} else if (now > times.sunset && now <= times.night) {
		lux = 40;
	} else if (now >= times.nightEnd && now < times.sunrise) {
		lux = 40;
	} else if (now > times.goldenHourEnd && now < times.goldenHour) {
		lux = 120000;
	}

	this.service.setCharacteristic(Characteristic.CurrentAmbientLightLevel, lux);


	var position = suncalc.getPosition(now, this.location.lat, this.location.long);
	var altitude = position.altitude * 180 / Math.PI;
	var azimuth = (position.azimuth * 180 / Math.PI + 180) % 360;

	altitude = Math.round(altitude / this.altitudeStep) * this.altitudeStep;
	azimuth = Math.round(azimuth / this.azimuthStep) * this.azimuthStep;

	//this.log("Sun is " + altitude + " high at " + azimuth);

	this.service.setCharacteristic(AltitudeCharacteristic, altitude);
	this.service.setCharacteristic(AzimuthCharacteristic, azimuth);

	setTimeout(this.updatePosition.bind(this), this.updatePeriod * 60 * 1000);
}
