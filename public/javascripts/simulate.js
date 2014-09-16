$('#simulate').submit(function(e) {
  var eventType = $('#simulate select[name="eventType"]').val();
  $.post('/simulate/api/', {eventType: eventType}, function(response) {
    if(response.success) {
      $('#alert')
        .html("Webhook Simulated")
        .removeClass()
        .addClass('alert alert-info');
    } else {
      $('#alert')
        .html("Error is simulating webhook")
        .removeClass()
        .addClass('alert alert-danger');
    }
  });
  return false;
});
