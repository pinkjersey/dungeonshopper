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
			   completeEventDealQuest: function (eventId, playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=completeEventDealQuest&eventId=' + eventId + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeEvent: function (eventId, playerId, gold, items, what1, where1, what2, where2, dest1, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=completeEvent&eventId=' + eventId + '&playerId=' + playerId + '&gold=' + gold + '&items=' + items + '&what1=' + what1 + '&where1=' + where1 + '&what2=' + what2 + '&where2=' + where2 + '&dest1=' + dest1,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               joinGame: function (gameKey, playerName, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=join&gameKey=' + gameKey  + '&name=' + playerName,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               listGames: function (callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=listGames',
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               discard: function (playerId, actionCost, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=discard&what=' + what + '&where=' + where + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               move: function (playerId, actionCost, what, src, dst, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=move&what=' + what + '&src=' + src + '&dst=' + dst + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeQuest: function (playerId, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=completeQuest&what=' + what + '&where=' + where + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyCart: function (playerId, actionCost, cart, goldFlag, items, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyCart&withGold=' + goldFlag + '&items=' + items + '&cart=' + cart + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               pass: function (playerId, discard, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=pass&items=' + discard + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               refresh: function (playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=refresh&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               marketTrade: function (playerId, actionCost, handItems, marketItems, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=marketTrade&handItems=' + handItems + '&marketItems=' + marketItems + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyAction: function (playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyAction' + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               fish: function (playerId, actionCost, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=fish&what=' + what + '&where=' + where + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               }

           }
       });


