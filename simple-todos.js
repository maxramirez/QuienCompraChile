Tasks = new Mongo.Collection("tasks");
//var fs = Npm.require('fs');
if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}
if (Meteor.isClient) {
  Meteor.subscribe("tasks");
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });
  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Meteor.call("addTask", text);

      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });
  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);

    },
    "click .delete": function () {
        Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  function ChileCompraDateString(date) {
    debugger;
    var day = date.getDay();
    var month = date.getMonth();
    var year = date.getYear();
    var dateString = day < 10 ? 0 : "" + day + month < 10 ? 0 : "" + month + year;
    return dateString;
  }

  function getAdjudicated(date) {
    var chileCompraDate = ChileCompraDateString(date);
    var response;
    $.ajax({
      url: "http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha="+chileCompraDate+"&estado=adjudicada&ticket=F8537A18-6766-4DEF-9E59-426B4FEE2844",
      async:false
    }).success(function (data) {
      response=data;
    });
    return response;
  }
  function getCompanies(){
    var companies=[];
    requestNumber = JSONRequest.post("https://json.penzance.org/request")
    $.ajax({
      url: "",
      context: document.body
    }).done(function() {
      $( this ).addClass( "done" );
    });
  }
}
Meteor.startup(function(){
  var filePath =  'c:/db/myFile.js'  ;
  //console.log( filePath ) ;    // shows /Uses/martinfox/tmp/auto-generated/myFile.js
  //var buffer = new Buffer( ) ;
  //fs.writeFileSync( filePath, buffer ) ;
});
Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
    setPrivate: function (taskId, setToPrivate) {
      var task = Tasks.findOne(taskId);

      // Make sure only the task owner can make a task private
      if (task.owner !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Tasks.update(taskId, {$set: {private: setToPrivate}});
    }
});
function getLic( initialDate, finalDate){
  var totalAdjudicated=[];
  while(+initialDate<+finalDate){
    var adjudicated = getAdjudicated(initialDate);
    totalAdjudicated.concat(adjudicated);
  }
}
