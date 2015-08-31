(function() {

  jenkins = {};
  jenkins.SettingsStore = function() { };

  jenkins.SettingsStore.prototype = {
    get: function(key, defaultValue) {
      var deferred = $.Deferred();
      chrome.storage.sync.get(key,
        function (storage) {
          deferred.resolve(storage[key] || defaultValue);
        });
      return deferred;
    },

    set: function(key, value) {
      var keyValueToSave = {};
      keyValueToSave[key] = value;

      chrome.storage.sync.set(keyValueToSave);
    },

    getServerURL: function() {
      return this.get("serverURL", '');
    },

    setServerURL: function(serverURL) {
      this.set("serverURL", serverURL);
    },

    getJobNames: function() {
      return this.get("jobNames", []);
    },

    setJobNames: function(jobNames) {
      this.set("jobNames", jobNames);
    },

    getTriggerBuild: function() {
      return this.get("triggerBuild", false);
    },

    setTriggerBuild: function(triggerBuild) {
      this.set("triggerBuild", triggerBuild);
    }
  };

})();
