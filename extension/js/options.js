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
  };

  var saveTriggerBuild = function(){
    var checked = $("#triggerBuild").prop('checked');
    settings.setTriggerBuild(checked);
  }

  var serverURLTextbox = $('#serverURL');
  settings.getServerURL().then(function(serverURL){
    serverURLTextbox.val(serverURL);
    serverURLTextbox.change(saveServerURLOnChange);
  });

  var jobNamesTextArea = $('#jobNames');
  settings.getJobNames().then(function(jobNames){
    jobNamesTextArea.text((jobNames).join(", "));
    jobNamesTextArea.change(saveJobNamesOnChange);
  });

  var triggerBuildCheckbox = $('#triggerBuild');
  settings.getTriggerBuild().then(function(checked){
    triggerBuildCheckbox.prop('checked', checked);
    triggerBuildCheckbox.change(saveTriggerBuild);
  });

  var backLink = window.location.href.endsWith("?show_back_link")
  $('#back-link').prop('hidden', !backLink);
});