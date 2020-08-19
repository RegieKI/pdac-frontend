# PDAC Frontend

Built with Sapper (Svelte SSR framework), SASS and PUG preprecessors. Contains submodule svelte-aui for rendering GUI elements and visual structures. Communicates with PDAC Backend via API, and to master control applications via WebSockets.

# Get Started

Node >= 12 should be used (12 and 13 should be interchangeable). Install all dependencies:

```
npm install
```

Run the development application:

```
npm run dev
```

Build production application:

```
npm run build
```

Run the production application:

```
npm start
```


# API Biz

```

  /usb
    GET: 'files:/home/pi/pdac/usb'

    # file browser for the pdac USB


  /info 
    GET: 'Info'

    # mushes together backend status with various system util statuses


  /network
    GET: 'NetworkUSB'

    # returns the contents of the USB wlan.txt


  /network/list
    GET: 'NetworkList'

    # returns a scanned list of nearby wlan networks


  /network/connect
    POST: 'ConnectToNetwork'

    # adds an ssid and psk to wpa_supplicant, then returns wpa status


  /session
    GET: 'SessionsList'

    # returns a directus list of sessions


  /session/:session
    GET: 'SessionByID'

    # returns a directus session config


  /session/:session/exercise
    GET: 'SessionByID'

    # returns a directus session config


  /session/:session/exercise/:exercise
    GET: 'SessionByID'

    # returns a directus session config


  /hostname
    GET: 'ParticipantsList',
    POST: 'SetHostname'

    # returns a directus list of devices (participants)


  /camera/start
    POST: 'CameraStart'

    # starts backend camera and formats json nicely


  /camera/stop
    POST: 'CameraStop'

    # stops backend camera and formats json nicely


  /system/update
    GET: 'SystemUpdate'

    # runs update script


  /system/reboot
    GET: 'SystemReboot'

    # runs reboot script


  /system/shutdown
    GET: 'SystemShutdown'

    # runs shutdown script

```
