# newtonMaus

Live control for home automation using a plugin-system for devices and systems.
This solution relies heavily on events and commands. The only communication channel 
is via websockets. Angular Material design for the remote. Up and running in minutes.

![Screenshot](http://i.imgur.com/BZc9t0X.png)

# Dependencies
* AngularJs
* Angular Material
* Auth0

# Systems
* Scheduler
* State Monitoring
* Log
* Bus
* Relay
* Socket

# Plugins
* Automatic
* ISY (Insteon)
* Marantz
* Twilio

# Major Features

## Customizable Web App
Easily configure a responsive web-app (remote control) with flex-box based material buttons and controls based on Google's material design.

## Declarative Monitored States with monitoring endpoint
Monitor device states to provide notifications when devices meet rules, like if any door
is unlocked. Also, built-in endpoints for 3rd party monitoring services.

## Declarative Event & Command Relay system
An expression tree to build IFTT-like workflows that react to conditions and rules and raise further
commands or execute functions. Build complex rules, like open the garage door as I drive up, but
only if I am in the car and started the trip somewhere else. Get notifications when doors open or a garage is left open.

## Declarative Scheduled Jobs
Use cron expressions to send out commands or events at any interval.
Add conditions to the jobs, so they only work under certain criteria, like
if it's raining, make sure the windows are closed.

## Directive Based UI
Make simple controls for the devices you want. Easily implement your own systems using a simple pattern.

# Build, Test, Run

Need to install build-tools for auto-processing of assets:
http://blog.modulus.io/using-npm-scripts-to-build-asset-pipeline

### mocha
Runs the tests.

### npm run build:assets
Builds all the client assets.

### npm run start:dev
Runs the app while watching and building the assets.

### npm run start
Runs the app.
