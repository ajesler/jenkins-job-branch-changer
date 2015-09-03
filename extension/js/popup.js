$(document).ready(function(){
  var jenkins = new Jenkins();

  var setMessage = function(text, klass) {
    $('#messages').html(text).attr("class", klass || "bg-info");
  }

  var jobNamesForDisplay = function(jobNames){
    var boldNames = _.map(jobNames, function(name){
      return "<b>"+name+"</b>";
    });
    return boldNames.join(", ");
  }

  var setAffectedJobsMessage = function() {
    // TODO show the currently assigned branch for each of the jobs?
    $.when(jenkins.getJobNames(), jenkins.getTriggerBuild()).then(function(jobNames, willTriggerBuild){
      var message = "This will apply to "+jobNamesForDisplay(jobNames);
      if(willTriggerBuild){
        message += " and will trigger a build for each job";
      }
      setMessage(message);
    });
  }

  jenkins.serverAvailable()
    .done(function(canReachJenkins, serverURL){
      if(canReachJenkins) {
        $('#updateForm').prop('hidden', false);
        $('#branchName').focus();
        setAffectedJobsMessage();
        $('#serverLink').attr('href', serverURL);
      } else {
        setMessage("Cant reach the server, please check your <a href='options.html?show_back_link'>settings</a>.", "bg-danger");
      }
    }
  );

  $('#branchName').on('input', function(event){
    var disabled = event.target.value.trim().length == 0;
    $('#updateButton').prop('disabled', disabled);
  });

  var resetUpdateControls = function() {
    $('#branchName').val('');
    $('#updateButton').button('reset');
    setTimeout(function(){ $('#updateButton').prop('disabled', 'disabled'); }, 5);
  };

  var submitBranchNameChange = function(){
    var newBranch = $('#branchName').val();

    if(newBranch.trim() == '') {
      return;
    }

    $('#updateButton').button('loading');
    jenkins.updateAllJobsBranch(newBranch)
      .done(function(){
        var args = Array.prototype.slice.call(arguments);
        setMessage("Updated jobs "+jobNamesForDisplay(args)+" to use branch <b>"+newBranch+"</b>", "bg-success");
        resetUpdateControls();
      })
      .fail(function(){
        setMessage("Failed to set branch for jobs.", "bg-danger");
        resetUpdateControls();
      });
  }

  $('#branchName').keypress(function (e) {
    if (e.which == 13) {
      submitBranchNameChange();
      return false;
    }
  });

  $('#updateButton').click(function(){
    submitBranchNameChange();
  });
});