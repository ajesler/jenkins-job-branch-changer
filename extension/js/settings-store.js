(function() {

  jenkins = {};
  jenkins.SettingsStore = function() { };

  jenkins.SettingsStore.prototype = {
    get: function(key) {
      var deferred = $.Deferred();
      chrome.storage.sync.get(key,
        function (storage) {
          deferred.resolve(storage[key]);
        });
      return deferred;
    },

    set: function(key, value) {
      var keyValueToSave = {};
      keyValueToSave[key] = value;

      chrome.storage.sync.set(keyValueToSave);
    },

    getServerURL: function() {
      return this.get("serverURL");
    },

    setServerURL: function(serverURL) {
      this.set("serverURL", serverURL);
    },

    getJobNames: function() {
      return this.get("jobNames");
    },

    setJobNames: function(jobNames) {
      this.set("jobNames", jobNames);
    }
  };

})();
