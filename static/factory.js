angular.module('dsApp')
       .factory('gameFactory', function ($http) {
           return {
               newGame: function (numberOfPlayers, playerName, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=new&numPlayers=' + numberOfPlayers + '&name=' + playerName,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeEvent: function (eventId, playerId, cartToDestroy, gold, what1, where1, what2, where2, dest1, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=completeEvent&eventId=' + eventId + '&playerId=' + playerId + '&cartToDestroy=' + cartToDestroy + '&gold=' + gold + '&what1=' + what1 + '&where1=' + where1 + '&what2=' + what2 + '&where2=' + where2 + '&dest1=' + dest1,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               joinGame: function (playerId, playerName, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=join&playerId=' + playerId  + '&name=' + playerName,
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
               move: function (what, src, dst, actionCost, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=move&what=' + what + '&src=' + src + '&dst=' + dst + '&actionCost=' + actionCost,
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
               refresh: function (playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=refresh&player=' + playerId,
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


