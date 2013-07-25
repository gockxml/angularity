angular.module('angularity.scrollbar', []).directive('scrollbar', function($parse, $timeout, $parse,$interpolate, $compile){
	var linkFunc =function(scope, element, attr, ctrl){
		var options = ctrl.options;
		options.hitBottom = attr.hitBottom;
		options.hitBottomCallback = function(event){
			scope.$hitBottomEvent = event;
			scope.$eval(attr.hitBottomCallback);
		}
		var on_scroll = $parse(attr.onScroll)
		attr.onScroll && (options.onScroll = function(event){
			scope.$apply(function(){
				on_scroll(scope, {$event : event})
            })
		})
		var on_focus = $parse(attr.onFocus)
		options.onFocus= function(event){
			scope.$apply(function(){
				on_focus(scope, {$event : event})
			})
		}

		attr.watchon && scope.$watch(attr.watchon + '.length', function(newValue, oldValue){
			$timeout(function(){
				if (attr.$attr['autoUpdatePosition'] && oldValue){
                    var pos = attr.autoUpdatePosition || 'bottom'
                    scope.$$scrollbar.update_scrollbar(pos);
                    /*
					if (oldValue  < newValue){
						scope.$$scrollbar.update_scrollbar(pos);
					}
					else{
						if (oldValue > newValue){
						}
                    }
                    */
				}
				scope.$$scrollbar.update_scrollbar();
			})
		});

		var scrollbar = scope;
		scope.$$scrollbar = {
			init: false,
			overview_style: {},
			viewport_style: {},
            stretchY: attr.viewStretchY,
            stretchMargin : attr.stretchMargin,
			update_scrollbar : function(pos){
				var self = scope.$$scrollbar;
				pos = pos || "relative";
				self.init && $timeout(function(){
				    $($(element[0])).tinyscrollbar_update(pos);
				})
			}
		}
		var fitcontent = attr.$attr['fitContent']
		var change_and_update = function(){

        }
        attr.$attr['stretchMargin'] && attr.$observe('stretchMargin', function(newValue, oldValue){
            scope.$$scrollbar.stretchMargin = newValue.indexOf('{{') >= 0 ? $interpolate(newValue)(scope) : newValue;
        })

		attr.$attr['contentWidth'] && attr.$observe('contentWidth', function(newValue, oldValue){
			//console.log(newValue, oldValue);
			scope.$$scrollbar.overview_style['width'] = newValue;
            scope.$$scrollbar.update_scrollbar();
            $timeout(function(){
                if (fitcontent && parseInt(newValue) < element[0].offsetWidth){
                    element.css('width', newValue);
                    var fn = $parse(attr.fitContent);
                    fn(scope);
                }
            })
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
            var bar = angular.element('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');
            ctrl.$bar = bar;
           if (options.axis == 'x'){
               element.append(ctrl.$bar);
           }else{
               element.prepend(ctrl.$bar);
           } 
           if (attr.indicator){
             var indicator = angular.element("<indicator current='" + attr.indicator + "' total='" + attr.indicatorTotal + "'></indicator>");
             element.append(indicator);
             $compile(indicator)(scope);
           }
           scope.$broadcast('$scroll_init')
            $timeout(function(){
                console.log('init scrollbar...');
                $($(element[0])).tinyscrollbar(options);
                scope.$$scrollbar.init = true;
            });
        }
		if (attr.$attr['lazyInit']){
            $timeout(function(){
                element.once_bind('mouseenter', function(event){
                    self.init || init_fn();
                    options.onFocus(event);
                })
            })
		}
		else{
				init_fn();
        }
        var unbind_update = scope.$on('$update_scrollbar', function(event, pos){
           scope.$$scrollbar.update_scrollbar(pos || 'relative');
        })
        var unbind = scope.$on('$destroy', function(){
            unbind_update();
			options = null;
			console.log('scrollbar destroy')
            $($(element[0])).tinyscrollbar_destroy();
            ctrl.$bar = null;
            ctrl.options = null;
			unbind();
			//view.remove();
			//bar.remove();
			//scope.$destroy()
        })
		
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
       link:linkFunc,
       controller: function($attrs, $element){
           this.options = angular.fromJson($attrs.scrollbar);
           //var element = $element;
          // var view = angular.element(element.children()[0]);
    }
	}
})
.directive('indicator', function($parse){
    return {
        restrict: "E",
        scope : {
            total: '='
        },
        replace: true,
        require:'^scrollbar',
        template:'<span class="scroll-indicator-wrapper"><span class="scroll-indicator"><span class="current">[[ current ]]</span>/<span class="total">[[ total ]]</span></span></span>',
        link: function(scope, element, attr, ctrl){
            element.remove();
            var unbind = scope.$on('$scroll_init', function(){
                unbind();
                ctrl.$bar.children(0).children(0).append(element);
                element.css('display', 'none');
                var on_scroll = $parse(attr.current)
                scope.current = 1
                var hide_indicator;
                ctrl.options.onScroll = function(event){
                    element.css('display', 'block');
                    hide_indicator != null && clearTimeout(hide_indicator);
                    hide_indicator = setTimeout(function(){
                        element.css('display', 'none');
                    }, 800);
                    scope.$apply(function(){
                        scope.current = on_scroll(scope, {$event : event})
                     })
                }
            })

        }
    }
});
