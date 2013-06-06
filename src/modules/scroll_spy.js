angular.module('angularity.scrollSpy', []).directive('scrollSpy', function(){
	return {
		restrict : "A",
		controller: function($scope, $window, $attrs, $document, $element, $parse, $timeout){
			$scope.spys = [];
			$scope.indicators = [];
			var controller = this;
			var is_jump = false;
			var jump_offset = parseInt($attrs.jumpOffset) || 0;
			var force_fluent = angular.identity
			var offset = (parseInt($attrs.offset) || 0);
			console.log($attrs)
			if ($attrs.forceFluent != null){
				force_fluent = function(target, original){
					var t = original - target;
					var gap = Math.abs(t);
					if (gap >1){
						return original - t / Math.abs(t)
						//return original;
					}
					/*
					else{
						if (gap == 1){
							return original - t / gap;
						}
					}
					*/
					return target;
				}
			}
			$element.controller().$scroll_spy = this;
			this.indexOf = function(element){
				return $scope.indicators.indexOf(element);
			}
			this.get_spy = function(indicator, allow_id){
				var i = angular.isNumber(indicator) ? indicator : $scope.indicators.indexOf(indicator);
				var s = document.getElementById($scope.spys[i]);
				return !s && allow_id ? $scope.spys[i] : s;
			}
			this.add_spy = function(index, spy){
				$scope.indicators.push(index);
				$scope.spys.push(spy);
			}
			this.jump_to = function(element){
				var s = controller.get_spy(element);
				console.log('in jump_to', s)
			
				// todo: need better implementation
				// top margin and determine spy
				//s && s.scrollIntoView();
				if (!s) return;
				document.body.scrollTop = s.offsetTop + jump_offset// + s.offsetHeight
				if (!document.body.scrollTop){
					document.documentElement.scrollTop = s.offsetTop + jump_offset// + s.offsetHeight
				}
				is_jump = true;
				$timeout(function(){
					var i = controller.indexOf(element);
					onscroll(null, i);
				});
				return true;
			}
			this.determine_click = function(element){
				var s = controller.get_spy(element, true);
				s = angular.isString(s) ? s : angular.element(s);
				var fn = $parse($attrs.clickSpy);
				$scope.$apply(function(){
					fn($scope, {$args : [element, s, controller]}) || controller.jump_to(element);
				})

			}
			var notify = function(index, message, direction){
				var indicator = $scope.indicators[index];
				var spy = angular.element(document.getElementById($scope.spys[index]));
				indicator && indicator.triggerHandler(message, [indicator, spy,  direction])
				$element.triggerHandler(message, [indicator, spy, direction])

			}

			// click has impact on which one is highlighted
			var onscroll = function(event, index){
				//console.log('scrollSpy...scroll')
				
				if (is_jump){
					is_jump = false;
					return;
				}
				// ie : documentElement for ie
				var top = (document.body.scrollTop || document.documentElement.scrollTop) - offset
				var views = $scope.spys.map(function(item){
					return document.getElementById(item);
				})
				var d = views.map(function(item, i){
					return	item && [ item.offsetTop + item.offsetHeight - top, item, i] 
					}).compact().sort(function(a, b){
						return  - a[0] +  b[0]
					});
				var target;
				if (index){
					target = index
				}
				else{
					target = d.select(function(a){ return a[0] <= 0})[0] || d[d.length - 1];
					second_target = d[d.indexOf(target) - 1];
					//if (second_target && Math.abs(second_target[0]) < Math.abs(target[0])){
						//console.log('change to second target', target, second_target);
						//target = second_target;
					//}
					//console.log('target/...', target)
					if (target && target[0] + offset < - 100 && second_target && second_target[2] == $scope.spy_target) {
						//console.log('maintain the target', target, second_target, $scope.spy_target);
						target = $scope.spy_target
					}
					else {
						target = target &&  target[2];
						if (target != null){
							target = force_fluent(target, $scope.spy_target)
						}
					}
				}
				var direction = - $scope.spy_target + target;	
				direction = direction > 0 ? 1 : -1;
				if (index) direction = 0;
				//console.log('target change:' , target, $scope.spy_target)
				if ($scope.spy_target != target){
					notify($scope.spy_target || 0, "$leavespy", direction);
					$scope.spy_target = target;
				}
				$scope.spy_target == null || notify($scope.spy_target, "$onspy", direction);
			}
			angular.element($window).safe_bind('scroll', onscroll, $scope);

			var unwatch = $scope.$watch($attrs.initOn, function(newValue){
				if (newValue){
					$timeout(function(){
						console.log('init scroll spy!!!', $attrs.initOn, newValue)
						onscroll(null, 0);
						unwatch();
					}, 1000)
				}
			})
			$attrs.onSpy && $element.safe_bind('$onspy', function(args){
				
				var fn = $parse($attrs.onSpy);
				//$scope.$apply(function(){
					fn($scope, {$args : args});
				//})
			})
			$attrs.leaveSpy && $element.safe_bind('$leavespy', function(args){
				
				var fn = $parse($attrs.leaveSpy);
				//$scope.$apply(function(){
					fn($scope, { $args : args });
				//})

			})
			/*
			$scope.$on('$destroy', function(){
				console.log('in destroy...')
			})
			*/
		},
		link: function(scope, element, attr){
			//console.log(scope.spys);
		}
	}
})
.directive('spyOn', function($parse){
	return {
		restrict: "A",
		require: "^scrollSpy",
		controller: function(){
		},
		link: function(scope, element, attr, controller){
			attr.$observe("spyOn", function(value){
				// todo : process change of spyOn
				controller.add_spy(element, value);
			})
			attr.onSpy && element.safe_bind('$onspy', function(args){
				
				var fn = $parse(attr.onSpy);
				scope.$apply(function(){
					fn(scope, args);
				})
		   })
		   attr.leaveSpy && element.safe_bind('$leavespy', function(args){
			   var fn = $parse(attr.leaveSpy);
			   scope.$apply(function(){
				   fn(scope, args);
			   })

		   })
		   element.click = function(){
			   controller.determine_click(element);
		   }
		   element.bind('click', function(){
				controller.determine_click(element);
		   })
		}
	}
})

