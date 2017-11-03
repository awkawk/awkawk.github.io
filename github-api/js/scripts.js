/* eslint-env browser */
/* eslint-disable no-console */
/* global GitHub */
(function(){
  var ORG = 'w3c';
  var REPOSITORY = 'wcag21';

var TOKEN = '47c29f1cfba08e17da2fe80e167958f252c0154d';

    function authenticate(token) {
    return new GitHub({
      token: token
    });
  }
    
  function updateTable(table) {
    // basic auth (we should use OAuth)
    var github = authenticate(TOKEN);
    var SC_LABEL_REGEXP = /^~comment-/;
    var PUBLICMEMBER_LABEL_REGEXP = /^Public|^Member/;
    var PUBLIC_LABEL_REGEXP = /^Public/;
    var MEMBER_LABEL_REGEXP = /^Member/;
    var labelsArray = [];

    function updateLabelRow(label) {
      var id = label.name;

      // get totals for row
      var totalOpenPublic = label.issues.open.filter(function(issue){
        return issue.labels.filter(function(label) {
          return PUBLIC_LABEL_REGEXP.test(label.name);
        }).length
      }).length;
      var totalClosedPublic = label.issues.closed.filter(function(issue){
        return issue.labels.filter(function(label) {
          return PUBLIC_LABEL_REGEXP.test(label.name);
        }).length
      }).length;
      var totalOpenMember = label.issues.open.filter(function(issue){
        return issue.labels.filter(function(label) {
          return MEMBER_LABEL_REGEXP.test(label.name);
        }).length
      }).length;
      var totalClosedMember = label.issues.closed.filter(function(issue){
        return issue.labels.filter(function(label) {
          return MEMBER_LABEL_REGEXP.test(label.name);
        }).length
      }).length;

      // get first link containing label
      var link = table.querySelector('a[href$="' + id + '"]');
      if (link) {
        // update the text content for the link
        link.textContent = totalOpenPublic;
        link.parentNode.nextElementSibling.firstElementChild.textContent = totalClosedPublic;
        link.parentNode.nextElementSibling.nextElementSibling.firstElementChild.textContent = totalOpenMember;
        link.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.textContent = totalClosedMember;
      }
    }

    var remoteIssues = github.getIssues(ORG, REPOSITORY);
    remoteIssues.listIssues({'state':'all'}, function(err, issues) {
      issues = issues.filter(function(issue) {
        return !issue.pull_request
        && issue.labels.filter(function(label) {
          return PUBLICMEMBER_LABEL_REGEXP.test(label.name);
        }).length
        && issue.labels.filter(function(label) {
          var match = SC_LABEL_REGEXP.test(label.name);
          // Store issue with label
          if (match) {
            if(!labelsArray[label.name]) {
              labelsArray[label.name] = label;
              labelsArray[label.name].issues = {open:[], closed:[]};
            }
            if (issue.state === 'open') {
              labelsArray[label.name].issues.open.push(issue);
            }
            else {
              labelsArray[label.name].issues.closed.push(issue);
            }
          }
          return match;
        }).length;
      });

      for (var key in labelsArray) {
        updateLabelRow(labelsArray[key]);
      }
    });
  }

  updateTable(document.getElementById('sc-status-tracking'));

})();
