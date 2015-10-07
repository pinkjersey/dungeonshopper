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
			   completeEventDealQuest: function (gameKey, eventId, playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=completeEventDealQuest&gameKey=' + gameKey + '&eventId=' + eventId + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeEvent: function (gameKey, eventId, playerId, gold, items, what1, where1, what2, where2, dest1, callback, errorcallback) {
                   $http({
                       method: 'GET',
					   url: '/game?action=completeEvent&gameKey=' + gameKey + '&eventId=' + eventId + '&playerId=' + playerId + '&gold=' + gold + '&items=' + items + '&what1=' + what1 + '&where1=' + where1 + '&what2=' + what2 + '&where2=' + where2 + '&dest1=' + dest1,
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
               discard: function (gameKey, playerId, actionCost, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=discard&gameKey=' + gameKey + '&what=' + what + '&where=' + where + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               move: function (gameKey, playerId, actionCost, what, src, dst, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=move&gameKey=' + gameKey + '&what=' + what + '&src=' + src + '&dst=' + dst + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               completeQuest: function (gameKey, playerId, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=completeQuest&gameKey=' + gameKey + '&what=' + what + '&where=' + where + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyCart: function (gameKey, playerId, actionCost, cart, goldFlag, items, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyCart&gameKey=' + gameKey + '&withGold=' + goldFlag + '&items=' + items + '&cart=' + cart + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               pass: function (gameKey, playerId, discard, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=pass&gameKey=' + gameKey + '&items=' + discard + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               refresh: function (gameKey, playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=refresh&gameKey=' + gameKey + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               marketTrade: function (gameKey, playerId, actionCost, handItems, marketItems, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=marketTrade&gameKey=' + gameKey + '&handItems=' + handItems + '&marketItems=' + marketItems + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               buyAction: function (gameKey, playerId, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=buyAction&gameKey=' + gameKey + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               },
               fish: function (gameKey, playerId, actionCost, what, where, callback, errorcallback) {
                   $http({
                       method: 'GET',
                       url: '/game?action=fish&gameKey=' + gameKey + '&what=' + what + '&where=' + where + '&actionCost=' + actionCost + '&playerId=' + playerId,
                       cache: false
                   }).success(callback)
                     .error(errorcallback);
               }

           }
       });


