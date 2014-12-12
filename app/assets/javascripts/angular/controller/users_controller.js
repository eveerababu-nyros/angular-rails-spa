var myApp = angular.module('myapplication', ['ngRoute', 'ngResource']); 

//Custom Filter for capitalize first letter in a string
myApp.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});


//Custom directive for modal box
myApp.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    }, //Template design for lightbox styles were included in applicaiton.css
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});

//Factory for user module
myApp.factory('Users', ['$resource',function($resource){
  return $resource('/users.json', {},{
    query: { method: 'GET', isArray: true },
    create: { method: 'POST' }
  })
}]);

myApp.factory('User', ['$resource', function($resource){
  return $resource('/users/:id.json', {}, {
    show: { method: 'GET' },
    update: { method: 'PUT', params: {id: '@id'} },
    delete: { method: 'DELETE', params: {id: '@id'} }
  });
}]);

//Controllers

// User list controller here user show, edit, create, index were rendering
myApp.controller("UserListCtr", ['$scope', '$http', '$resource', 'Users', 'User', '$location', function($scope, $http, $resource, Users, User, $location) {

  $scope.users = Users.query();

  $scope.modalShown = false;
  $scope.toggleModal = function(id) {
    $scope.modalShown = !$scope.modalShown;
    $scope.user = User.show({id: id});
  };

  
  $scope.deleteUser = function (userId) {
    if (confirm("Are you sure you want to delete this user?")){
      User.delete({ id: userId }, function(){
        $scope.users = Users.query();
        $location.path('/');
      });
    }
  };
}]);


myApp.controller("ExamCtrl", ['$scope', '$http', '$resource', '$routeParams', function($scope, $http, $resource, $routeParams) {

  $scope.no_of_question = 0;
  $scope.correct_answred = 0;
  $scope.un_answered = 0;

  var q1 = 0;
  var q2 = 0;
  var q3 = 0;
  var q4 = 0;
  var q5 = 0;
  var q6 = 0;
  var q7 = 0;
  var q8 = 0;
  var q9 = 0;
  var q10 = 0;

  var a1 = 0;
  var a2 = 0;
  var a3 = 0;
  var a4 = 0;
  var a5 = 0;
  var a6 = 0;
  var a7 = 0;
  var a8 = 0;
  var a9 = 0;
  var a10 = 0;

  $scope.exam_answer = function(res) {
    var que = res.split("_")[0];
    var ans = res.split("_")[1]
    //Updating no_of_question varaible 
    switch (que) {
        case "1":
              q1 = q1+1;
              if(q1 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }

              if(ans == "C" && a1 == 0){
                a1 = a1 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a1 != 0) {
                a1 = a1 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "2":
            q2 = q2+1;
              if(q2 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }

            if(ans == "A" && a2 == 0){
              a2 = a2 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a2 != 0) {
                a2 = a2 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "3":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "D" && a3 == 0){
              a3 = a3 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a3 != 0) {
                a3 = a3 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "4":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "D" && a4 == 0){
              a4 = a4 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a4 != 0) {
                a4 = a4 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "5":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "B" && a5 == 0){
              a5 = a5 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a5 != 0) {
                a5 = a5 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "6":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "C" && a6 == 0){
              a6 = a6 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a6 != 0) {
                a6 = a6 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "7":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "A" && a7 == 0){
              a7 = a7 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a7 != 0) {
                a7 = a7 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "8":
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "B" && a8 == 0){
              a8 = a8 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a8 != 0) {
                a8 = a8 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "9":
            //$("#q_9 input[type=radio]").attr("disabled", true);
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "D" && a9 == 0){
              a9 = a9 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a9 != 0) {
                a9 = a9 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
        case "10":
            //$("#q_10 input[type=radio]").attr("disabled", true);
            $scope.no_of_question = $scope.no_of_question + 1;
            if(ans == "A" && a10 == 0){
              a10 = a10 + 1;
                if($scope.correct_answred == 0){
                  $scope.correct_answred = 1;
                }
                else {
                  $scope.correct_answred = $scope.correct_answred + 1;
                }
              }
              else if(a10 != 0) {
                a10 = a10 - 1
                $scope.correct_answred = $scope.correct_answred - 1;
              }
            break;
      }
  }

  
  

}]);

/* Show action
myApp.controller("UserShowCtr", ['$scope', '$http', '$resource', 'Users', 'User', '$location', '$routeParams', function($scope, $http, $resource, Users, User, $location, $routeParams) {
  $scope.user = User.show({id: $routeParams.id});
  //$scope.show_flag = true
  //$scope.users = Users.query();
  console.log($scope.user)
}]);
*/
myApp.controller("UserUpdateCtr", ['$scope', '$resource', 'User', 'Users', '$location', '$routeParams', function($scope, $resource, User, $location, $routeParams) {
  $scope.user = User.get({id: $routeParams.id})
  $scope.users = Users.query();
  alert($routeParams.id)
  $scope.update = function(){
    if ($scope.userForm.$valid){
      User.update({id: $scope.user.id},{user: $scope.user},function(){
        $location.path('/');
      }, function(error) {
        console.log(error)
      });
    }
  };
  
  $scope.addAddress = function(){
    $scope.user.addresses.push({street1: '', street2: '', city: '', state: '', country: '', zipcode: '' })
  }

  $scope.removeAddress = function(index, user){
    var address = user.addresses[index];
    if(address.id){
      address._destroy = true;
    }else{
      user.addresses.splice(index, 1);
    }
  };

}]);

myApp.controller("UserAddCtr", ['$scope', '$resource', 'Users', 'User', '$location', '$routeParams', function($scope, $resource, Users, User, $location, $routeParams) {
  $scope.user = {addresses: [{street1: '', street2: '', city: '', state: '', country: '', zipcode: '' }]}
  //$scope.flag = "";
  //alert('sda')
  if($routeParams.id)
  {
    //alert()
    $scope.flag = "2";
    $scope.user = User.show({id: $routeParams.id});
    $scope.users = Users.query();
  }
  else
  {
      $scope.flag = "1";
  }

  $scope.update = function(){
    //if ($scope.userForm.$valid){
      User.update({id: $scope.user.id},{user: $scope.user},function(){
        $location.path('/');
      }, function(error) {
        console.log(error)
      });
    //}
  };

  $scope.save = function () {
    //if ($scope.userForm.$valid){
      Users.create({user: $scope.user}, function(){
        $location.path('/');
      }, function(error){
        console.log(error)
      });
    //}
  }




  $scope.addAddress = function(){
    $scope.user.addresses.push({street1: '', street2: '', city: '', state: '', country: '', zipcode: '' })
  }

  $scope.removeAddress = function(index, user){
    var address = user.addresses[index];
    if(address.id){
      address._destroy = true;
    }else{
      user.addresses.splice(index, 1);
    }
  };

}]);


//Routes
myApp.config([
  '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/users',{
      templateUrl: '/templates/users/index.html',
      controller: 'UserListCtr'
    });
    $routeProvider.when('/users/:id/edit', {
      templateUrl: '/templates/users/index.html',
      controller: "UserAddCtr"
    });
    $routeProvider.when('/exams', {
      templateUrl: '/templates/exam/index.html',
      controller: "ExamCtrl"
    });
    $routeProvider.otherwise({
      redirectTo: '/users'
    });
  }
]);

// Exam Module goes here
// Factory and Controller for exam module goes here