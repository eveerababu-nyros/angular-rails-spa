var myApp = angular.module('myapplication', ['ngRoute', 'ngResource']); 

//Configuration

var login_test = false;

//Custom Filter for capitalize first letter in a string
myApp.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});


myApp.factory('Records', function($resource) {
        return $resource('/api/record.json', {}, {
            index: { method: 'GET', isArray: true},
            create: { method: 'POST' }
        });
})
.factory('Secure', function($resource){
    return $resource('/api/record/:record_id.json', {}, {
      show: { method: 'GET' },
      update: { method: 'PUT' },
      destroy: { method: 'DELETE' }
   });
});



myApp.factory('Session', function($location, $http, $q) {
        // Redirect to the given url (defaults to '/')
    $loggedin = false;
        function redirect(url) {
            url = url || '/admin/login';
            $location.path(url);
        }
        var service = {
            login: function(email, password) {
               // alert("1");
                return $http.post('/api/sessions', {admin: {email: email, password: password} })
                    .then(function(response) {
                        //alert("2")
                        service.currentAdmin = response.data.admin;
                        if (service.isAuthenticated()) {
                            //alert("3");
                              login_test = true;
                                $loggedin= true
                                $location.path('/users');
                            }
                        });
            },

            logout: function(redirectTo) {
                $http.delete('/api/sessions').then(function(response) {
                    $http.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken;
                    console.log(service.currentAdmin)
                    service.currentAdmin = null;
                    login_test = false;
                    redirect(redirectTo);
                });
            },

            register: function(email, password, confirm_password) {
                return $http.post('/api/admins', {admin: {email: email, password: password, password_confirmation: confirm_password} })
                .then(function(response) {
                    service.currentAdmin = response.data;
                    if (service.isAuthenticated()) {
                        $loggedin = true;
                            $location.path('/users');
                    }
                });
            },
            requestCurrentAdmin: function() {
                if (service.isAuthenticated()) {
                    return $q.when(service.currentAdmin);
                } else {
                    return $http.get('/api/admins').then(function(response) {
                        service.currentAdmin = response.data.admin;
                        return service.currentAdmin;
                    });
                }
            },

            currentAdmin: null,

            isAuthenticated: function(){
                return !!service.currentAdmin;
            }
        };
        return service;
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


myApp.controller("AppCtrl", ['$scope', 'Session', '$rootScope', function($scope, Session, $rootScope) {
  "use strict";

    $scope.$on('event:unauthorized', function(event) {
        console.log('unauthorized');
    });
    $scope.$on('event:authenticated', function(event) {
        console.log('authenticated');
    });
}]);


myApp.controller("AdminCtrl", ['$scope', 'Session', function($scope, Session) {
    $loggedin = false;
    $scope.login = function(admin) {
      //alert();
        $scope.authError = null;
        Session.login(admin.email, admin.password)
        .then(function(response) {
            if (!response) {
                $scope.authError = 'Credentials are not valid';
            } else {
                console.log(response);
                $loggedin = true;
                //alert("entered");
                $scope.authError = 'Success!';
            }
        }, function(response) {
            $scope.authError = 'Server offline, please try later';
        });
    };

    $scope.logout = function(admin) {
        $loggedin = false;
        alert("")
        Session.logout(admin);
    };

    $scope.register = function(admin) {
        $scope.authError = null;
        Session.register(admin.email, admin.password, admin.confirm_password)
            .then(function(response) {
               console.log(response);
            }, function(response) {
                var errors = '';
                $.each(response.data.errors, function(index, value) {
                    errors += index.substr(0,1).toUpperCase()+index.substr(1) + ' ' + value + ''
                });
                $scope.authError = errors;
            });
    };
}]);

// User list controller here user show, edit, create, index were rendering
myApp.controller("UserListCtr", ['$scope', '$http', '$resource', 'Users', 'User', '$location','Session', function($scope, $http, $resource, Users, User, $location,Session) {
if(login_test)
{
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
}
else{
  $location.path('/admins/login')
}
  
}]);


myApp.controller("ExamCtrl", ['$scope', '$http', '$resource', '$location','$routeParams', 'Session', function(Session, $scope, $http, $location, $resource, $routeParams) {
$scope.showResult = false;
 $scope.no_of_question = 0;
  $scope.correct_answred = 0;
  $scope.un_answered = 0;
if(login_test)
{
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
    $scope.showResult = false;
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
              q3 = q3+1;
              if(q3 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
            
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
            q4 = q4+1;
              if(q4 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q5 = q5+1;
              if(q5 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q6 = q6+1;
              if(q6 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q7 = q7+1;
              if(q7 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q8 = q8+1;
              if(q8 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q9 = q9+1;
              if(q9 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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
            q10 = q10+1;
              if(q10 == 1) {
                $scope.no_of_question = $scope.no_of_question + 1;
                $scope.un_answered = 10 - $scope.no_of_question
              }
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

  
  $scope.show_result = function(){
    //alert("entered");
    //alert($scope.correct_answred);
    $scope.showResult = true;
  }
}
else {
  $location.path('/users')
  //$window.location.href = "http://localhost:3000/"

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
  '$httpProvider', function(provider){
    provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    var interceptor = ['$location', '$rootScope', '$q', function($location, $rootScope, $q) {
            function success(response) {
                return response
            };

            function error(response) {
                if (response.status == 401) {
                    $rootScope.$broadcast('event:unauthorized');
                    $location.path('/admins/login');
                    return response;
                };
                return $q.reject(response);
            };

            return function(promise) {
                return promise.then(success, error);
            };
        }];
        //provider.responseInterceptors.push(interceptor);
  }])
  .config([
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
    $routeProvider.when('/', {
      templateUrl:'/templates/home/index.html'
    });
    $routeProvider.when('/admins/login', {
      templateUrl:'/templates/admins/login.html', 
      controller:"AdminCtrl"});
    $routeProvider.when('/admins/register', {
      templateUrl:'/templates/admins/register.html', 
      controller:"AdminCtrl"});
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  }
]);

// Exam Module goes here
// Factory and Controller for exam module goes here