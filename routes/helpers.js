function randomLocation() {
  //48.895, -123.901
  //27.783968, -69.672700
  return {
    lat: (27.8 + Math.random() * 21),
    lon: (-123.9 + Math.random() * 54.3),
    accuracy_m: 18
  };
}


exports.generateEvent = function(user_id, eventType) {
  var event = {
    user: {
      id: user_id
    },
    location: randomLocation(),
    created_at: new Date().valueOf(),
    vehicle: {"id":"C_40ed9887baf98ffd","year":2014,"make":"Subaru","model":"Outback","display_name":"Outback ","color":"#3782e7"}
  };

  if(eventType == 'notification:hard_brake') {
    event.g_force = 0.283;
    event.type = 'notification:hard_brake';
  } else if(eventType == 'notification:hard_accel') {
    event.g_force = 0.283;
    event.type = 'notification:hard_accel';
  } else if(eventType == 'notification:speeding') {
    event.speed_mph = 77;
    event.type = 'notification:speeding';
  } else if(eventType == 'trip:finished') {
    event.type = 'trip:finished';
  } else if(eventType == 'ignition:on') {
    event.type = 'ignition:on';
  } else if(eventType == 'ignition:off') {
    event.type = 'ignition:off';
  } else if(eventType == 'mil:on') {
    event.type = 'mil:on';
    event.dtcs = [
      {
        "code": "P0442",
        "description": "Small fuel vapor leak in EVAP system",
        "start": 1383448450301
      }
    ];
  } else if(eventType == 'mil:off') {
    event.type = 'mil:off';
    event.dtcs = [
      {
        "code": "P0442",
        "description": "Small fuel vapor leak in EVAP system",
        "start": 1383448450301
      }
    ];
  }

  return event;
};
