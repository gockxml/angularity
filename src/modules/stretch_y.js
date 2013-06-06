angular.module('angularity.stretchY', []).directive('stretchY', function($parse, $window, $timeout){
	return {
		link:function(scope, element, attr){
			attr.$observe('stretchY', function(value){
				if (value){
					var fn = $parse(value);
					console.log('init stretching');
					var resize = function(){
						var c = element[0];
						var p = c.offsetParent;
						element.css('height', p.offsetHeight- c.offsetTop - parseInt(attr.stretchMargin || 0) + "px")
						scope.$apply(function(){
							fn(scope);
						})
					}
					angular.element($window).bind("resize", resize);
					//$window.onresize = 
					$timeout(function(){
						resize();
					})
					scope.$on("$destroy", function(){
						console.log("gc...");
						angular.element($window).unbind("resize", resize);
					})
				}
			})
		}
}
})
