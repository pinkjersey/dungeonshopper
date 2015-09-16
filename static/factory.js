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
               },
               move: function (what, src, dst, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=move&what=' + what + '&src=' + src + '&dst=' + dst,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeQuest: function (what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=completeQuest&what=' + what + '&where=' + where,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyCart: function (cart, goldFlag, items, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyCart&withGold=' + goldFlag + '&items=' + items + '&cart=' + cart,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               pass: function (discard, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=pass&items=' + discard,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               refresh: function (callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=refresh',
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               marketTrade: function (handItems, marketItems, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=marketTrade&handItems=' + handItems + '&marketItems=' + marketItems,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyAction: function (callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyAction',
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
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


