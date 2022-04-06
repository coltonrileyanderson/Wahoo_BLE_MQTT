const mqtt = require("mqtt");

const host = 'broker.emqx.io';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const topic = '/nodejs/mqtt';

const connectUrl = `mqtt://${host}:${port}`;

MQTTConnect(mqtt, connectUrl, clientId, topic);
const MQTTConnect = (mqtt, connectUrl, clientId, topic) => {
  console.log("hit");
  const client = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: 'emqx',
      password: 'public',
      reconnectPeriod: 1000,
    });
  
  client.on('connect', () => {
    console.log('Connected')
    client.subscribe([topic], () => {
      console.log(`Subscribe to topic '${topic}'`)
    })
  });

  const publishData = (data) => {

  };
};
