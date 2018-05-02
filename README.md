# homebridge-sun-position
[![npm](https://img.shields.io/npm/v/homebridge-sun-position.svg)](https://www.npmjs.com/package/homebridge-sun-position)
[![npm](https://img.shields.io/npm/dt/homebridge-sun-position.svg)](https://www.npmjs.com/package/homebridge-sun-position)

This is a plugin for [Homebridge](https://github.com/nfarina/homebridge) to create a [HomeKit](https://www.apple.com/uk/ios/home/) accessory representing the position of the sun in the sky.

The intended use is with automation rules when combined with accessories such as window coverings, to adjust their position based on the true position of the sun.

You can download it from [npm](https://www.npmjs.com/package/homebridge-sun-position).

## Installation

1. Install and setup [Homebridge](https://github.com/nfarina/homebridge).

2. Install this plugin:
```
npm install -g homebridge-sun-position
```
3. Add a `SunPosition` accessory to your Homebridge `config.json`, providing the latitude and longitude of your location:

```
    "accessories" : [
        {   
            "accessory" : "SunPosition",
            "name": "Sun",
            "location": {
            	"lat": 37.2343,
            	"long"  -115.8067
            }
        }
    ]
```

## Usage

A single "Sun" accessory is added to your home, represented as a Light Sensor; the lux values are somewhat arbitrary and are based on the current phase of the day. HomeKit requires a recognized service for automation, and this seemed like the closest thing.

To use the Altitude and Azimuth characteristics, you will need an app such as Matthias Hochgatterer's [Home - Smart Home Automation](https://itunes.apple.com/us/app/home-smart-home-automation/id995994352?mt=8) app. Using this app you can see the current position of the sun:

![Characteristics](https://i.imgur.com/lRAdM0S.png)

And you can create automations based on its position:

![Automation](https://i.imgur.com/ZHUVaKQ.png?)
