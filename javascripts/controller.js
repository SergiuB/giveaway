angular.module('giveawayApp', ['ui.bootstrap']);
angular.module('giveawayApp', ["firebase", 'ui.bootstrap'])
  .controller('ItemsController', ['$scope', "$firebase", "$modal",
    function($scope, $firebase, $modal) {
      var ref = new Firebase("https://incandescent-inferno-6504.firebaseio.com/items");
      $scope.sync = $firebase(ref);
      $scope.sync.$asObject().$bindTo($scope, "items");

      $scope.deadlinePassed = function() {
        return new Date(2014, 10, 4, 23, 59) < new Date();
      };

      $scope.getArray = function(size) {
        var arr = [];
        for (var i = size; i > 0; i--) {
          arr.push(i);
        }
        return arr;
      };

      $scope.openImage = function(itemId, picIndex) {
        var modalInstance = $modal.open({
          templateUrl: 'modalImage.html',
          controller: 'ModalImgCtrl',
          size:'lg',
          resolve: {
            itemId: function() {
              return itemId;
            },
            picIndex: function() {
              return picIndex;
            }
          }
        });
      };
    }

  ])
  .controller('DonationController', ['$scope',
    function($scope) {

      $scope.donateClick = function(itemId, sum) {
        $scope.donationIntent = {
          amount: sum,
          name: "",
          email: ""
        };
      };

      $scope.donateAbort = function() {
        $scope.donationIntent = null;
      };

      $scope.topDonation = function(itemId) {
        if ($scope.items[itemId].donations) {
          return _.max($scope.items[itemId].donations, function(donation) {
            return donation.amount;
          });
        } else {
          return null;
        }

      };

      $scope.isAvailable = function(itemId) {
        return !($scope.deadlinePassed() && $scope.items[itemId].donations);
      };

      $scope.nextDonationAmount = function(itemId) {
        var topDonation = $scope.topDonation(itemId);
        return (topDonation) ? topDonation.amount + 10 : null;
      };

      $scope.commitDonation = function(itemId) {
        $scope.donationIntent.timestamp = Date.now();
        $scope.sync.$ref().child(itemId + '/donations').push($scope.donationIntent, function(error) {
          if (error) {
            alert("Ne pare rau, pare ca s-a intamplat ceva neasteptat. Mai apasa o data acum sau revino mai tarziu." + error);
          } else {
            var userName = $scope.donationIntent.name;
            $scope.$apply(function() {
              $scope.donationIntent = null;
            });
            alert("Iti multumim " + userName + "!\n\nTe rugam sa urmaresti periodic pagina pana marti la ora 23:59 pentru a vedea daca cineva face o donatie mai mare pentru obiectul dorit (e o aplicatie facuta intr-o zi, nu vin update-uri pe email sorry :) )\n\nNoi te vom contacta in cursul zilei de miercuri pentru a stabili detaliile!");
          }
        });

      };
    }
  ])
  .controller('ModalImgCtrl', function($scope, $modalInstance, itemId, picIndex) {

  $scope.itemId = itemId;
  $scope.picIndex = picIndex;

  $scope.ok = function() {
    $modalInstance.close();
  };
});