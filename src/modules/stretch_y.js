angular.module('angularity.stretchY', []).directive('stretchY', function($parse, $window, $timeout){
	return {
		link:function(scope, element, attr){
			var fn;
			var resize = function(){
				var c = element[0];
				var p = c.offsetParent;
				var h = p.offsetHeight - c.offsetTop - parseInt(attr.stretchMargin || 0)
				h && element.css('height', h + "px")
				fn(scope);
			}
			scope.$on('$stretch_y_resize', resize)
			attr.$observe('stretchY', function(value){
				if (value){
					fn = $parse(value);
					console.log('init stretching', attr.stretchMargin );
					angular.element($window).bind("resize", resize);
					//$window.onresize = 
					$timeout(function(){
						scope.$apply(function(){
							resize();
						})
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
