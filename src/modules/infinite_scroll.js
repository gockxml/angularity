angular.module('angularity.infiniteScroll', []).directive('infiniteScroll', function($compile,$window){
	return function(scope, element, attr){
		var raw = element[0];
		var threshold = parseInt(attr.threshold) || 50;
		var mutex = attr.mutex == ""
		var axis = attr.axis || "y"
		var listener = element;
		var get_height = function(element){
			return element.offsetHeight;
		}
		if (attr.bindwindow != undefined){
			raw = document.body;
			listener = angular.element($window);
			get_height = function(element){

				//refer: https://github.com/jquery/jquery/blob/master/src/dimensions.js#L16
				return document.documentElement.clientHeight;
			}
		}
		scope.infinite_scroll_loading = angular.element($compile(attr.loading)(scope));
		element.append(scope.infinite_scroll_loading);
		element.records = {};
		var handler = function(){
			var h = raw.scrollHeight;
			//console.log(element.records);
			//if (raw.scrollTop + raw.offsetHeight  + threshold >= h){
			if ((raw.scrollTop ||  document.documentElement.scrollTop) + get_height(raw) + threshold >= h){
				if (!element.records[h]){
					console.log('!!!!!!!!!!!!!!!!scroll')
					scope.$apply(attr.infiniteScroll)
					element.records[h] = true;
				}
				else{
					console.log("!!!!!cannot loading");
				}
				if (scope.end_infinite_scroll){
					console.log('end');
					scope.infinite_scroll_loading.remove();
					scope.$apply(attr.endcallback);
				}
			}
		};	
		listener.safe_bind('scroll', handler, scope);
		scope.$on("$infinite_scroll_pause" ,function(){
			listener.unbind('scroll', handler);
		})
		scope.$on("$infinite_scroll_resume" ,function(){
			listener.bind('scroll', handler);
		})
	}
});

