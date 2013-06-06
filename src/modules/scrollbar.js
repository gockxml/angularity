angular.module('angularity.scrollbar', []).directive('scrollbar', function($parse, $timeout, $parse,$interpolate, $compile){
	var linkFunc =function(scope, element, attr){
		var options = angular.fromJson(attr.scrollbar);
		options.hitBottom = attr.hitBottom;
		options.hitBottomCallback = function(event){
			scope.$hitBottomEvent = event;
			scope.$eval(attr.hitBottomCallback);
		}
		var on_scroll = $parse(attr.onScroll)
		options.onScroll = function(event){
			scope.$apply(function(){
				on_scroll(scope, {$event : event})
			})
		}
		var on_focus = $parse(attr.onFocus)
		options.onFocus= function(event){
			scope.$apply(function(){
				on_focus(scope, {$event : event})
			})
		}
		var view = angular.element(element.children()[0]);
		var bar = angular.element('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');
		if (options.axis == 'x'){
			element.append(bar);
		}else{
			element.prepend(bar);
		}
		attr.watchon && scope.$watch(attr.watchon, function(newValue, oldValue){
			$timeout(function(){
				if (attr.$attr['autoUpdatePosition'] && oldValue && oldValue.length){
					if (oldValue.length  < newValue.length){
						scope.$$scrollbar.update_scrollbar('bottom');
					}
					else{
						if (oldValue.length > newValue.length){
							scope.$$scrollbar.update_scrollbar('top');
						}
					}
				}
				scope.$$scrollbar.update_scrollbar();
			})
		}, true);

		var scrollbar = scope;
		scope.$$scrollbar = {
			init: false,
			overview_style: {},
			viewport_style: {},
			stretchY: attr.viewStretchY,
			update_scrollbar : function(pos){
				var self = scope.$$scrollbar;
				pos = pos || "relative";
				self.init && $timeout(function(){
				    $(element).tinyscrollbar_update(pos);
				})
			}
		}
		var fitcontent = attr.$attr['fitContent']
		var change_and_update = function(){

		}
		attr.$attr['contentWidth'] && attr.$observe('contentWidth', function(newValue, oldValue){
			//console.log(newValue, oldValue);
			scope.$$scrollbar.overview_style['width'] = newValue;
			scope.$$scrollbar.update_scrollbar();
			if (fitcontent && parseInt(newValue) < element[0].offsetWidth){
				element.css('width', newValue);
				var fn = $parse(attr.fitContent);
				fn(scope);
			}
		});
		attr.$attr['contentHeight'] && attr.$observe('contentHeight', function(newValue, oldValue){
			scope.$$scrollbar.overview_style['height'] = newValue;
			scope.$$scrollbar.update_scrollbar();
		})
		attr.$attr['viewWidth'] && attr.$observe('viewWidth', function(newValue, oldValue){
			scope.$$scrollbar.viewport_style['width'] = newValue;
			scope.$$scrollbar.update_scrollbar();
		});
		attr.$attr['viewHeight'] && attr.$observe('viewHeight', function(newValue, oldValue){
			scope.$$scrollbar.viewport_style['height'] = newValue;
			scope.$$scrollbar.update_scrollbar();
		})

		var init_fn = function(){
			console.log('init scrollbar...');
			$(element).tinyscrollbar(options);
			scope.$$scrollbar.init = true;
		}
		if (attr.$attr['lazyInit']){
			element.once_bind('mouseenter', function(event){
				self.init || init_fn();
				options.onFocus(event);
			})
		}
		else{
			$timeout(function(){
				init_fn();
			});
		}
		
	} 
	return {
		restrict : "A",
		templateUrl: directiveUtils.base_path + 'control/' + 'scrollbar.html',
		transclude : true,
		/*
		scope:{
			contentWidth :"@",
			contentHeight : "@",
			viewHeight : "@",
			viewWidth : "@",
			viewStretchY: "@"
		},
		*/
		link:linkFunc
	}
});

