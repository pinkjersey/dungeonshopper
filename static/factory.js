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
                       url: '/game?action=join&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               discard: function (what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=discard&what=' + what + '&where=' + where,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               }
               fish: function (what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=fish&what=' + what + '&where=' + where,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               }

           }
       });


