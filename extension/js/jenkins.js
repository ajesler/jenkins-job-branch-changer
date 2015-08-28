var Jenkins = function (jenkinsServerURL, jobNames) {
  this.settings = new jenkins.SettingsStore;
};

Jenkins.prototype.jobNames = function() {
  return this.settings.getJobNames();
};

Jenkins.prototype.urlFor = function(path) {
  var defer = $.Deferred();
  this.settings.getServerURL().done(function(serverURL){
    defer.resolve(serverURL+path);
  })
  return defer;
};

Jenkins.prototype.urlForJobConfig = function(jobName) {
  return this.urlFor("/job/"+jobName+"/config.xml");
};

Jenkins.prototype.serverAvailable = function () {
  var deferred = $.Deferred();
  this.settings.getServerURL().done(function(serverURL){
    $.get(serverURL)
      .done(function () { deferred.resolve(true) })
      .fail(function () { deferred.resolve(false) })
  })
  return deferred;
};

Jenkins.prototype.loadJobConfig = function(jobName) {
  var defer = $.Deferred();

  var config_url = this.urlForJobConfig(jobName).then(function(jobConfigURL){
    $.ajax({
      type: "GET",
      url: jobConfigURL,
      dataType: "xml",
      success: function(xml) {
        defer.resolve(xml);
      }
    })
  });

  return defer;
};

Jenkins.prototype.saveJobConfig = function(jobName, config_xml) {
  var defer = $.Deferred();

  this.urlForJobConfig(jobName).then(function(jobConfigURL){
    $.ajax({
      type: "POST",
      url: jobConfigURL,
      data: config_xml
    })
    .done(function(data, textStatus, jqXHR) {
      console.log('Updated config for '+jobName+'!');
      defer.resolve(jobName);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('Failed to update config for '+jobName+'!');
      defer.reject(jobName);
    });
  });

  return defer;
};

Jenkins.prototype.changeBranchNameInConfig = function(config_xml, newBranch) {
  var xml = $(config_xml).find('hudson\\.plugins\\.git\\.BranchSpec>name').text(newBranch);
  return xml;
};

Jenkins.prototype.xmlToString = function(xml) {
  return new XMLSerializer().serializeToString(xml);
};

Jenkins.prototype.updateJobBranch = function(jobName, newBranch) {
  var updateConfigBranchName = function(config_xml) {
    var defer = $.Deferred();

    var updated_config = this.changeBranchNameInConfig(config_xml, newBranch);
    var updated_config_string = this.xmlToString(config_xml);

    defer.resolve(jobName, updated_config_string);
    return defer;
  }.bind(this);

  return this.loadJobConfig(jobName).then(updateConfigBranchName).then(this.saveJobConfig.bind(this));
};

Jenkins.prototype.updateAllJobsBranch = function(newBranch) {
  var updateJobs = function(jobNames) {
    var updates = _.map(jobNames, function(job){
      return this.updateJobBranch(job, newBranch);
    }, this);
    return $.when.apply(null, updates);
  }.bind(this);

  return this.settings.getJobNames().then(updateJobs);
};

var setMessage = function(text, klass) {
  $('#messages').html(text).attr("class", klass || "bg-info");
}

var jobNamesForDisplay = function(jobNames){
  var boldNames = _.map(jobNames, function(name){
    return "<b>"+name+"</b>";
  });
  return boldNames.join(", ");
}

$(document).ready(function(){
  var jenkins = new Jenkins();

  jenkins.urlFor("/reset_configs").then(function(url) { $.post(url) });

  jenkins.serverAvailable()
    .done(function(canReachJenkins){
      var iconClass = canReachJenkins ? "svg-green" : "svg-black";
      $('#icon').attr("class", iconClass);
      
      if(canReachJenkins) {
        $('#updateForm').prop('hidden', false);
        jenkins.jobNames().then(function(jobNames){
          setMessage("This will apply to "+jobNamesForDisplay(jobNames))
        });
      } else {
        setMessage("Cant reach the server, please check your settings.", "bg-danger");
      }
    }
  );

  $('#branchName').on('input', function(event){
    var disabled = event.target.value.length == 0;
    $('#updateButton').prop('disabled', disabled);
  });

  $('#updateButton').click(function(){
    var newBranch = $('#branchName').val();
    jenkins.updateAllJobsBranch(newBranch)
      .done(function(){
        var args = Array.prototype.slice.call(arguments);
        setMessage("Updated jobs "+jobNamesForDisplay(args)+" to use branch <b>"+newBranch+"</b>", "bg-success");
        $('#icon').attr("class", "svg-magenta");
        setTimeout(function() { $('#icon').attr("class", "svg-green"); }, 3000);
      })
      .fail(function(){
        setMessage("Failed to set branch for jobs.", "bg-danger");
      })
      .always(function(){
        $('#branchName').val('');
      });
  });
});