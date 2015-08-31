$(document).ready(function(){
  var settings = new jenkins.SettingsStore;

  var saveJobNamesOnChange = function(event) {
    var jobNamesString = event.target.value;
    jobNamesString = jobNamesString.replace(/(\r\n|\n|\r)/gm,"");
    var jobNames = _(jobNamesString.split(","))
      .map(function(name){ 
        return name.trim();
      })
      .filter(function(name){
        return name && name.length > 0;
      })
      .value();
    settings.setJobNames(jobNames);
  };

  var saveServerURLOnChange = function(event) {
    var url = event.target.value;
    settings.setServerURL(url);
  }

  var jobNamesTextArea = $('#jobNames');

  settings.getJobNames().then(function(jobNames){
    jobNamesTextArea.text((jobNames || []).join(", "));

    jobNamesTextArea.change(saveJobNamesOnChange);
  });

  var serverURLTextbox = $('#serverURL');
  settings.getServerURL().then(function(serverURL){
    serverURLTextbox.val(serverURL);
    serverURLTextbox.change(saveServerURLOnChange);
  });

  var backLink = window.location.href.endsWith("?show_back_link")
  $('#back-link').prop('hidden', !backLink);
});