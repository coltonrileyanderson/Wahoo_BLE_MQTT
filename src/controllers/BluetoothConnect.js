const BluetoothConnect = () => {
   // Discovering bluetooth devices MUST be triggered by a user gesture for security
   connect.addEventListener('pointerup', function(event) {
    navigator.bluetooth.requestDevice({
      // filters: [{
      //   namePrefix: 'Wahoo'
      // }],
      acceptAllDevices: true,
      optionalServices: [
        '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
        '00001814-0000-1000-8000-00805f9b34fb', // Running Speed & Cadence
        '00001816-0000-1000-8000-00805f9b34fb', // Cycling Speed & Cadence
        '00001818-0000-1000-8000-00805f9b34fb', // Cycling Power
        '00001826-0000-1000-8000-00805f9b34fb', // Fitness Machine
      ]
    })
    .then(device => device.gatt.connect())        
    .then(server => {
      return Promise.all([
        getDeviceInformation(server),
        //server.getPrimaryService('00001816-0000-1000-8000-00805f9b34fb') // Cycling Speed & Cadence
        server.getPrimaryService('00001818-0000-1000-8000-00805f9b34fb') // Cycling Power
          .then(service => {
            return Promise.all([
            
              // service.getCharacteristic('00002a5d-0000-1000-8000-00805f9b34fb') // Sensor location
              //   .then(characteristic => {
              //     // Set up event listener for when characteristic value changes.
              //     characteristic.addEventListener('characteristicvaluechanged', (event) => { 
              //       console.log("Sensor location", characteristic.uuid, event.target.value.getUint8(0) ) 
              //     });
              //     return characteristic.readValue()
              //   }),  

              service.getCharacteristic('00002a63-0000-1000-8000-00805f9b34fb') // Cycling Power Measurement (NOTIFY)
                .then(characteristic => {
                  return characteristic.startNotifications().then(_ => {
                    console.log('> Notifications started');
                    characteristic.addEventListener('characteristicvaluechanged', (event) => { 
                      let rawMeasurement = event.target.value
                      characteristic.addEventListener('characteristicvaluechanged', (event) => {
                        const flagsString = dec2bin(event.target.value.getUint16(0));
                        const instant_power = event.target.value.getInt16(2, true)  // Resolution is 1 watts
                        // const instant_cadence 
                        // const instant_speed
                        instant_power_data.innerHTML = `${instant_power} watts`
                        console.log("Cycling Power", flagsString, dec2bin(event.target.value.getUint16(1)),instant_power); 
                      });
                    });
                  });
                }),  
              // service.getCharacteristic('00002a65-0000-1000-8000-00805f9b34fb') // Cycling Power Feature
              //   .then(characteristic => {
              //     // Set up event listener for when characteristic value changes.
              //     characteristic.addEventListener('characteristicvaluechanged', (event) => { console.log("value changed", characteristic.uuid, event.target.value.getUint8(0))});
              //     return characteristic.readValue()
              //   }),  
              // service.getCharacteristic('00002a66-0000-1000-8000-00805f9b34fb') //  Cycling Power Control Point
              //   .then(characteristic => {
              //     // Set up event listener for when characteristic value changes.
              //     characteristic.addEventListener('characteristicvaluechanged', (event) => { console.log("value changed", characteristic.uuid, event.target.value.getUint8(0))});
              //     return characteristic.readValue()
              //   }), 
              // service.getCharacteristic('a026e005-0a7d-4ab3-97fa-f1500f9feb8b') //  ????
              //   .then(characteristic => {
              //     // Set up event listener for when characteristic value changes.
              //     characteristic.addEventListener('characteristicvaluechanged', (event) => { console.log("value changed", characteristic.uuid, event.target.value.getUint8(0))});
              //     return characteristic.readValue()
              //   }), 
            ])
          })
      ])
    })
    .catch(error => { console.log(error); });

    const logDataView = (labelOfDataSource, key, valueDataView) => {
      const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
        return b.toString(16).padStart(2, '0');
      }).join(' ');
      const textDecoder = new TextDecoder('ascii');
      const asciiString = textDecoder.decode(valueDataView.buffer);

      console.log(
        labelOfDataSource +
        ' Data: ' + key +
          '\n    (Hex) ' + hexString +
          '\n    (ASCII) ' + asciiString
      );

    };

    // From https://stackoverflow.com/a/16155417
    function dec2bin(dec){
        return (dec >>> 0).toString(2);
    }

    const getDeviceInformation = (server) => {
      return server.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb')
        .then(service => {
          return Promise.all([
            // Firmware Revision String
            service.getCharacteristic('00002a26-0000-1000-8000-00805f9b34fb')
              .then(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', (event) => { 
                  logDataView("Firmware Revision", characteristic.uuid, event.target.value ) 
                });
                return characteristic.readValue()
              }), 
            // Hardware revision string
            service.getCharacteristic('00002a27-0000-1000-8000-00805f9b34fb')
              .then(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', (event) => { 
                  logDataView("Hardware Revision", characteristic.uuid, event.target.value ) 
                });
                return characteristic.readValue()
              }), 
            // Manufacturer name string
            service.getCharacteristic('00002a29-0000-1000-8000-00805f9b34fb')
              .then(characteristic => {
                // Set up event listener for when characteristic value changes.
                characteristic.addEventListener('characteristicvaluechanged', (event) => { 
                  logDataView("Manufacturer", characteristic.uuid, event.target.value ) 
                });
                return characteristic.readValue()
              }), 
          ])
        })
    }
  }) 
};


