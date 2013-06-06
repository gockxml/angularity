angular.module('angularity.scrollFix', []).directive('scrollFix', function($window, $document){
	return function(scope, element, attr){
		scope.$element = element;
		var threshold = parseInt(attr.threshold) || 0;
		var handler = function(){
			var top = document.body.scrollTop || document.documentElement.scrollTop;
			var newValue = scope.$eval(attr.scrollFix);
			if (newValue <=  top ){
				element.css({ position: 'fixed', top: threshold + "px"})
			}
			else{
				element.css({ position: 'relative', top: 0 })
			}
		}
		angular.element($window).safe_bind('scroll', handler, scope);

	}
})

