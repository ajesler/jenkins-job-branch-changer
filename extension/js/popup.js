$(document).ready(function(){
  var setMessage = function(text, klass) {
    $('#messages').html(text).attr("class", klass || "bg-info");
  }

  var jobNamesForDisplay = function(jobNames){
    var boldNames = _.map(jobNames, function(name){
      return "<b>"+name+"</b>";
    });
    return boldNames.join(", ");
  }

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
        $('#branchName').focus();
      } else {
        setMessage("Cant reach the server, please check your <a href='options.html?show_back_link'>settings</a>.", "bg-danger");
      }
    }
  );

  $('#branchName').on('input', function(event){
    var disabled = event.target.value.length == 0;
    $('#updateButton').prop('disabled', disabled);
  });

  var submitBranchNameChange = function(){
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