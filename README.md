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
            "name" : "Sun",
            "location" : {
            	"lat" : 37.2343,
            	"long" : -115.8067
            }
        }
    ]
```

## Screenshots

A single "Sun" accessory is added to your home, represented as a Light Sensor; the lux values are somewhat arbitrary and are based on the current phase of the day. HomeKit requires a recognized service for automation, and this seemed like the closest thing.

To use the Altitude and Azimuth characteristics, you will need an app such as Matthias Hochgatterer's [Home - Smart Home Automation](https://itunes.apple.com/us/app/home-smart-home-automation/id995994352?mt=8) app. Using this app you can see the current position of the sun, and create automations based on it:

![Characteristics](https://i.imgur.com/lRAdM0S.png)
![Automation](https://i.imgur.com/ZHUVaKQ.png?)

## Usage

To use this plugin you need to be reasonably comfortable with HomeKit automation, and understand the differences between Triggers and Conditions, and their limitations.

As of iOS 11.3, Threshold Range Event triggers do not seem to work with custom characteristics. Fortunately you can still check for *Any Change*, and combine that with conditions to verify the range.

If your HomeKit Automation app does not allow you to set two different conditions for the same characteristic, simply create two Sun accessories (Sun A and Sun B) in your `config.json`.

In addition, a trigger's End Event only seems to support Time Events, and not full characteristics as documented. You will need a second automation to "undo" the first, use a dummy switch such as from [homebridge-dummy](https://www.npmjs.com/package/homebridge-dummy) to track the state.

Here is an example of rules to close window blinds when the sun shines through a South-facing window, and open them again once it passes:

**Close Blinds**
> **Triggers:**<br>
> Sun Azimuth *Any Change*
> 
> **Conditions:**<br>
> Sun Azimuth &ge; 115.0&deg;<br>
> Sun Azimuth &lt; 235.0&deg;
> 
> **Actions:**<br>
> Set Scene *blinds down*<br>
> Set Dummy Switch *on*

**Open Blinds**
> **Triggers:**<br>
> Sun Azimuth *Any Change*
> 
> **Conditions:**<br>
> Sun Azimuth &ge; 235.0&deg;<br>
> Dummy Switch = on
> 
> **Actions:**<br>
> Set Scene *blinds up*<br>
> Set Dummy Switch *off*

More advanced rules can be created by combing the azimuth and altitude of the sun, and by combing weather information such as from [homebridge-weather-extended](https://www.npmjs.com/package/homebridge-weather-station-extended).

He is an example for west-facing blinds that, only on a sunny day, come down in two phases based on the altitude of the sun, and go back up again once it's behind the houses or hills.

**Half-close Blinds**
> **Triggers:**<br>
> Sun Azimuth *Any Change*
> 
> **Conditions:**<br>
> Weather Condition Category = 0<br>
> Sun Azimuth &ge; 220.0&deg;<br>
> Sun Altitude &le; 50.0&deg;<br>
> Sun Altitude &gt; 30.0&deg;
> 
> **Actions:**<br>
> Set Scene *blinds half down*<br>
> Set Dummy Switch *on*

**Fully-close Blinds**
> **Triggers:**<br>
> Sun Azimuth *Any Change*
> 
> **Conditions:**<br>
> Weather Condition Category = 0<br>
> Sun Azimuth &ge; 220.0&deg;<br>
> Sun Altitude &le; 30.0&deg;<br>
> Sun Altitude &gt; 10.0&deg;
> 
> **Actions:**<br>
> Set Scene *blinds fully down*<br>
> Set Dummy Switch *on*

**Open Blinds at Sunset**
> **Triggers:**<br>
> Sun Azimuth *Any Change*
> 
> **Conditions:**<br>
> Sun Azimuth &ge; 220.0&deg;<br>
> Sun Altitude &le; 10.0&deg;<br>
> Dummy Switch = on
> 
> **Actions:**<br>
> Set Scene *blinds up*<br>
> Set Dummy Switch *off*

**Open Blinds when Cloudy**
> **Triggers:**<br>
> Weather Condition Category *Any Change*
> 
> **Conditions:**<br>
> Weather Condition Category &gt; 0<br>
> Dummy Switch = on
> 
> **Actions:**<br>
> Set Scene *blinds up*<br>
> Set Dummy Switch *off*
