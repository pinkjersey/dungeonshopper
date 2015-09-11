angular.module('dsApp')
       .factory('gameFactory', function ($http) {
           return {
               newGame: function (numberOfPlayers, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       //url: 'http://vdknycfl00222:13080/game?action=new&numPlayers=' + numberOfPlayers,
					   url: '/game?action=new&numPlayers=' + numberOfPlayers,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               joinGame: function (playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       //url: 'http://vdknycfl00222:13080/game?action=join&playerId=' + playerId,
                       url: '/game?action=join&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               }
           }
       });


