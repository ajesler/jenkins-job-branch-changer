var Jenkins = function (jenkinsServerURL, jobNames) {
  this.settings = new jenkins.SettingsStore;
};

Jenkins.prototype.getJobNames = function() {
  return this.settings.getJobNames();
};

Jenkins.prototype.getTriggerBuild = function() {
  return this.settings.getTriggerBuild();
};

Jenkins.prototype.urlFor = function(path) {
  var defer = $.Deferred();
  this.settings.getServerURL().done(function(serverURL){
    serverURL = serverURL.endsWith('/') ? serverURL.substring(0, serverURL.length-1) : serverURL
    path = path.startsWith('/') ? path.substring(1) : path

    var url = serverURL+'/'+path;

    defer.resolve(url);
  })
  return defer;
};

Jenkins.prototype.urlForJobConfig = function(jobName) {
  return this.urlFor("view/All/job/"+jobName+"/config.xml");
};

Jenkins.prototype.urlForJobTrigger = function(jobName) {
  return this.urlFor("view/All/job/"+jobName+"/build");
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
  // TODO what if there is no git.BranchSpec ?
  var xml = $(config_xml).find('hudson\\.plugins\\.git\\.BranchSpec>name').text(newBranch);
  return xml;
};

Jenkins.prototype.xmlToString = function(xml) {
  var xmlString = new XMLSerializer().serializeToString(xml);
  return xmlString;
};

Jenkins.prototype.updateJobBranch = function(jobName, newBranch) {
  var updateConfigBranchName = function(config_xml) {
    var defer = $.Deferred();

    var hasGitBranchName = function() {
      return $(config_xml).find('hudson\\.plugins\\.git\\.BranchSpec>name').length > 0;
    };

    if (hasGitBranchName()) {
      var updated_config = this.changeBranchNameInConfig(config_xml, newBranch);
      var updated_config_string = this.xmlToString(config_xml);

      defer.resolve(jobName, updated_config_string);
    } else {
      defer.fail(jobName, "Missing git branch name in config");
    }
    return defer;
  }.bind(this);

  var saveJobConfig = this.saveJobConfig.bind(this);

  var triggerBuildIfSet = function() {
    return this.settings.getTriggerBuild().then(function(triggerBuild){
      if(triggerBuild) {
        return this.triggerBuild(jobName);
      } else {
        var defer = $.Deferred();
        defer.resolve(jobName);
        return defer;
      }
    }.bind(this));
  }.bind(this);

  return this.loadJobConfig(jobName)
    .then(updateConfigBranchName)
    .then(saveJobConfig)
    .then(triggerBuildIfSet);
};

Jenkins.prototype.triggerBuild = function(jobName) {
  var postToURL = function(url) {
    return $.post(url).then(function(){
      var defer = $.Deferred();
      defer.resolve(jobName);
      return defer;
    });
  };

  return this.urlForJobTrigger(jobName).then(postToURL);
};

Jenkins.prototype.updateAllJobsBranch = function(newBranch) {
  var updateJobs = function(jobNames) {
    var updates = _.map(jobNames, function(job) {
      return this.updateJobBranch(job, newBranch);
    }, this);
    return $.when.apply(null, updates);
  }.bind(this);

  return this.settings.getJobNames().then(updateJobs);
};