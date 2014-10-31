var map = L.mapbox.map('map', 'automatic.h5kpm228', {maxZoom: 16}).setView([37.9, -122.5], 10)
  , geocoder = L.mapbox.geocoder('automatic.h5kpm228')
  , markers = []
  , events = {
      'ignition:on': 'Ignition On'
    , 'ignition:off': 'Ignition Off'
    , 'trip:finished': 'Trip Summary'
    , 'notification:speeding': 'Speed Exceeded Threshold'
    , 'notification:hard_brake': 'Hard Brake'
    , 'notification:hard_accel': 'Hard Acceleration'
    , 'region:changed': 'Region Changed'
    , 'parking:changed': 'Parking Location Changed'
    , 'mil:on': 'MIL (check engine light) On'
    , 'mil:off': 'MIL (check engine light) Cleared'
    , 'hmi:interaction': 'Car Interaction'
  },
  markerLayer = L.mapbox.featureLayer().addTo(map),
  icon = L.mapbox.marker.icon({
    'marker-size': 'small',
    'marker-color': '#38BE43',
    'marker-symbol': 'circle'
  });

/* Web socket connection */
var ws = new WebSocket((window.document.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.document.location.host);
ws.onopen = function () {
  $('#alert')
    .html('<b>Connected:</b> Waiting for events')
    .removeClass()
    .addClass('alert alert-info');
}
ws.onmessage = function (msg) {
  var data = JSON.parse(msg.data)
    , date = new Date(parseInt(data.created_at))
    , title = events[data.type] || 'Unknown'
    , description = [];


  console.log(data);

  description.push('<b>' + title + '</b>');

  description.push('Date: <b>' + moment(date).format('MMM D, YYYY') + '</b>');
  description.push('Time: <b>' + moment(date).format('h:mm a') + '</b>');

  if (data.vehicle) {
    description.push('Vehicle: <b>' + data.vehicle.year + ' ' + data.vehicle.make  + ' ' + data.vehicle.model + (data.vehicle.display_name ? ' (' + data.vehicle.display_name + ')' : '') + '</b>');
  }


  if (data.location) {
    if(data.location.accuracy_m) {
      description.push('Accuracy: <b>' + data.location.accuracy_m.toFixed(0) + 'm</b>');
    }

    if (data.type === 'trip:finished') {
      description.push('Distance: <b>' + data.distance_mi + ' miles</b>');
      description.push('Duration: <b>' + data.duration_min + ' minutes</b>');
      description.push('Average MPG: <b>' + data.average_mpg + ' mpg</b>');
      description.push('Start Location: <b>' + data.start_location + '</b>');
      description.push('End Location: <b>' + data.end_location + '</b>');
    } else if (data.type === 'notification:speeding') {
      description.push('Speed: <b>' + data.speed_mph.toFixed() + ' mph</b>');
    } else if (data.type === 'notification:hard_accel') {
      description.push('Acceleration: <b>' + data.g_force.toFixed(3) + 'g</b>');
    } else if (data.type === 'notification:hard_brake') {
      description.push('Deceleration: <b>' + data.g_force.toFixed(3) + 'g</b>');
    } else if (data.type === 'region:changed') {
      description.push(data.region.status + ' ' + data.region.name + ' (' + data.region.tag + ')');
    } else if (data.type === 'mil:on' || data.type == 'mil:off') {
      if(data.dtcs) {
        data.dtcs.forEach(function(dtc) { description.push('MIL: <b>' + dtc.code + ': ' + dtc.description + '</b>'); });
      }
    } else if (data.type === 'hmi:interaction') {
      description.push('Button: <b>' + data.button.id + ' ' + data.interaction + '</b>');
    }

    updateAlert(title, '');
    addMarker(data.location.lat, data.location.lon, title, description.join('<br>'));

    geocoder.reverseQuery([data.location.lon, data.location.lat], function(e, response) {
      var location = buildLocation(response);
      logMessage(title, date, location);
      updateAlert(title, location);
    });
  }

  if(data.type == 'trip:summary' && data.trip.path) {
    var polyline = L.Polyline.fromEncoded(data.trip.path, {color: '#08b1d5', opacity: 0.9});

    map.fitBounds(polyline.getBounds());

    polyline.addTo(map);
  }
};

setInterval(function() {
  ws.send('ping');
}, 15000);


function addMarker(lat, lon, title, description) {
  var marker = L.marker([lat, lon], {
    title: title,
    icon: icon
  });
  marker.addTo(markerLayer);
  markers.push([lat, lon]);
  map.fitBounds(markers);
  map.panTo([lat, lon]);
  marker.bindPopup(description, {className: 'driveEvent-popup'});
  marker.openPopup();
}

function updateAlert(type, message) {
  $('#alert')
    .html('<b>' + type + ':</b> ' + message)
    .removeClass()
    .addClass('alert alert-success');
}

function logMessage(type, date, location) {
  $('<div>')
    .html('<b>' + type + '</b><span class="location">' + location + '</span><br><em><small>' + moment(date).format('YYYY-MM-DD h:mm a') + '</small></em>')
    .prependTo('#log');
}

function buildLocation(response) {
  var location = ''
  try {
    location += response.results[0][0].name;

    if (response.results[0][1].type != 'country') {
      location += ', ' + response.results[0][1].name;
    }
  } catch(e) { }
  return location;
}

$('#simulate').submit(function(e) {
  var eventType = $('#simulate select[name="eventType"]').val();
  $.post('/simulate/api/', {eventType: eventType}, function(response) {
    if(response.success) {
      $('#alert')
        .html('Webhook Simulated')
        .removeClass()
        .addClass('alert alert-info');
    } else {
      $('#alert')
        .html('Error is simulating webhook')
        .removeClass()
        .addClass('alert alert-danger');
    }
  });
  return false;
});

$('.btn-clear').click(function() {
  markerLayer.clearLayers();
})
