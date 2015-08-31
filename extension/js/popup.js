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
    jenkins.jobNames().then(function(jobNames){
      setMessage("This will apply to "+jobNamesForDisplay(jobNames))
    });
  }

  jenkins.serverAvailable()
    .done(function(canReachJenkins){
      if(canReachJenkins) {
        $('#updateForm').prop('hidden', false);
        $('#branchName').focus();
        setAffectedJobsMessage();
      } else {
        setMessage("Cant reach the server, please check your <a href='options.html?show_back_link'>settings</a>.", "bg-danger");
      }
    }
  );

  $('#branchName').on('input', function(event){
    var disabled = event.target.value.trim().length == 0;
    $('#updateButton').prop('disabled', disabled);
  });

  var submitBranchNameChange = function(){
    var newBranch = $('#branchName').val();
    jenkins.updateAllJobsBranch(newBranch)
      .done(function(){
        var args = Array.prototype.slice.call(arguments);
        setMessage("Updated jobs "+jobNamesForDisplay(args)+" to use branch <b>"+newBranch+"</b>", "bg-success");
        setTimeout(function() {
          setAffectedJobsMessage();
        }, 3000);
      })
      .fail(function(){
        setMessage("Failed to set branch for jobs.", "bg-danger");
      })
      .always(function(){
        $('#branchName').val('');
        $('#updateButton').prop('disabled', true);
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