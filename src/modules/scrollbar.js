angular.module('angularity.scrollbar', [])
.factory('Scrollbar', function(){
    var default_options =  {
                axis         : 'y'    // vertical or horizontal scrollbar? ( x || y ).
            ,   wheel        : 40     // how many pixels must the mouswheel scroll at a time.
            ,   scroll       : true   // enable or disable the mousewheel.
            ,   lockscroll   : true   // return scrollwheel to browser if there is no more content.
            ,   size         : 'auto' // set the size of the scrollbar to auto or a fixed number.
            ,   sizethumb    : 'auto' // set the size of the thumb to auto or a fixed number.
            ,   invertscroll : 'ontouchstart' in document.documentElement  // Enable mobile invert style scrolling
            ,   autofocus : false
        } 
    var fn = {
        init : function(elem, params){
            var options = angular.extend({}, default_options, params);
            return new ScrollbarEntity(elem, options)
        } 
    }
    return fn;
    function ScrollbarEntity( root, options )
    {
        var $ = angular.element;
        var oSelf       = this
        ,   oWrapper    = root
        ,   oViewport   = { obj: $(root[0].querySelector('.viewport')) }
        ,   oContent    = { obj: $(root[0].querySelector('.overview')) }
        ,   oScrollbar  = { obj: $(root[0].querySelector('.scrollbar')) }
        ,   oTrack      = { obj: $(root[0].querySelector('.track')) }
        ,   oThumb      = { obj: $(root[0].querySelector('.thumb')) }
        ,   sAxis       = options.axis === 'x'
        ,   sDirection  = sAxis ? 'left' : 'top'
        ,   sSize       = sAxis ? 'Width' : 'Height'
        ,   iScroll     = 0
        ,   iPosition   = { start: 0, now: 0 }
        ,   iMouse      = {}
        ,   touchEvents = 'ontouchstart' in document.documentElement
        ,   hitBottom = false
        ,   bottomThreshold = options['bottomThreshold'] || 20
        ,   isDragging = false
		,   isOut = false
		,	hitBottomTimes = 0
		,   onScroll = options['onScroll']
		,   onFocus = options['onFocus']
        ;

        function initialize()
        {
            oSelf.update();
            setEvents();
			if (options['autofocus']){
				$(oWrapper).bind('mouseenter', function(){
					if (!oScrollbar.obj.hasClass('disable')){
						//oScrollbar.obj.animate({ opacity: 1}, 200)
                        oScrollbar.obj.css('opacity', '1')
						isOut = false;
						onFocus && onFocus();
					}
				}).bind('mouseleave'
					, function(){
					if (!oScrollbar.obj.hasClass('disable')){
                        if (!isDragging) oScrollbar.obj.css('opacity', '0');
						//if (!isDragging) oScrollbar.obj.animate({ opacity : 0}, 200)
						isOut = true;
					}
				});
				//oScrollbar.obj.animate({ opacity: 0}, 200)
			}
			oScrollbar.obj.addClass("axis-" + options.axis);
			return oSelf;
		}
		this.destroy = function(){
			onFocus = null;	
			onScroll = null;
			options = null;
			oThumb.obj.unbind( 'mousedown', start );
            oTrack.obj.unbind( 'mouseup', drag );
            $(oWrapper).unbind('mouseenter').unbind('mouseleave')
            unbindEvent();
			/*
			oViewport.obj.remove()
			oContent.obj.remove();
			oScrollbar.obj.remove();
			oTrack.obj.remove();
			oThumb.obj.remove();
			*/

		}
        this.update = function( sScroll , smooth)
        {
            oViewport[ options.axis ] = oViewport.obj[0][ 'offset'+ sSize ];
            oContent[ options.axis ]  = oContent.obj[0][ 'scroll'+ sSize ];
            oContent.ratio            = oViewport[ options.axis ] / oContent[ options.axis ];

            oScrollbar.obj.toggleClass( 'disable', oContent.ratio >= 1 );

            oTrack[ options.axis ] = options.size === 'auto' ? oViewport[ options.axis ] : options.size;
            oThumb[ options.axis ] = Math.min( oTrack[ options.axis ], Math.max( 0, ( options.sizethumb === 'auto' ? ( oTrack[ options.axis ] * oContent.ratio ) : options.sizethumb ) ) );
        
            oScrollbar.ratio = options.sizethumb === 'auto' ? ( oContent[ options.axis ] / oTrack[ options.axis ] ) : ( oContent[ options.axis ] - oViewport[ options.axis ] ) / ( oTrack[ options.axis ] - oThumb[ options.axis ] );
            
            iScroll = ( sScroll === 'relative' && oContent.ratio <= 1 ) ? Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll )) : 0;
            iScroll = ( sScroll === 'bottom' && oContent.ratio <= 1 ) ? ( oContent[ options.axis ] - oViewport[ options.axis ] ) : isNaN( parseInt( sScroll, 10 ) ) ? iScroll : Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, parseInt( sScroll, 10 )));
            
            setSize(smooth);
        };
 
        function setSize(smooth)
        {
            var sCssSize = sSize.toLowerCase();

            var v_thumb = {}, v_content = {};
            v_thumb[sDirection] = iScroll / oScrollbar.ratio;
            v_content[sDirection] = -iScroll;
            func = "css";
            //if (smooth) func = "animate";
            //oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
            //oContent.obj.css( sDirection, -iScroll );
            oThumb.obj[func](v_thumb);
            oContent.obj[func](v_content);
            iMouse.start = $offset(oThumb.obj)[ sDirection ];

            oScrollbar.obj.css( sCssSize, oTrack[ options.axis ] + 'px');
            oTrack.obj.css( sCssSize, oTrack[ options.axis ]  + 'px');
            oThumb.obj.css( sCssSize, oThumb[ options.axis ] + 'px');

        }

        function setEvents()
        {
            if( ! touchEvents )
            {
                oThumb.obj.bind( 'mousedown', start );
                oTrack.obj.bind( 'mouseup', drag );
            }
            else
            {
                oViewport.obj[0].ontouchstart = function( event )
                {   
                    if( 1 === event.touches.length )
                    {
                        start( event.touches[ 0 ] );
                        event.stopPropagation();
                    }
                };
            }

            if( options.scroll && window.addEventListener )
            {
                oWrapper[0].addEventListener( 'DOMMouseScroll', wheel, false );
                oWrapper[0].addEventListener( 'mousewheel', wheel, false );
            }
            else if( options.scroll )
            {
                oWrapper[0].onmousewheel = wheel;
            }
        }
        function unbindEvent(){
            oThumb.obj.unbind( 'mousedown', start );
            oTrack.obj.unbind( 'mouseup', drag );
            oWrapper[0].removeEventListener( 'DOMMouseScroll', wheel);
            oWrapper[0].removeEventListener( 'mousewheel', wheel)
        }
        function start( event )
        {
            var pos = getXY(event);
            $(document.body).addClass( "noSelect" );

            var oThumbDir   = parseInt( oThumb.obj.css( sDirection ), 10 );
            iMouse.start    = sAxis ? pos.pageX : pos.pageY;
            iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
            
            if( ! touchEvents )
            {
                $( document ).bind( 'mousemove', drag );
                $( document ).bind( 'mouseup', end );
                oThumb.obj.bind( 'mouseup', end );
            }
            else
            {
                document.ontouchmove = function( event )
                {
                    event.preventDefault();
                    drag( event.touches[ 0 ] );
                };
                document.ontouchend = end;        
            }
            isDragging = true;
        }
        function judgeBottom(iScroll){
          var b = oContent[ options.axis ] - oViewport[ options.axis ]  - iScroll  - bottomThreshold;
          if (!hitBottom && b <= 0){
            //hitBottom = b;
			if (options['hitBottomCallback']) {
				hitBottomTimes +=1;
				options['hitBottomCallback'].call(null, { hitBottomTimes: hitBottomTimes});
			}
          }
          if (hitBottom && b > 0){
            hitBottom = false;
          }
        }
        function wheel( event )
        {
            if( oContent.ratio < 1 )
            {
                var oEvent = event || window.event
                ,   iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3
                ;

                iScroll -= iDelta * options.wheel;
                iScroll = Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll ));

                oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio + 'px' );
                oContent.obj.css( sDirection, -iScroll + 'px' );

                if( options.lockscroll || ( iScroll !== ( oContent[ options.axis ] - oViewport[ options.axis ] ) && iScroll !== 0 ) )
                {
                    //oEvent = $fix( oEvent );
					oEvent.preventDefault ? oEvent.preventDefault() : (oEvent.returnValue = false);
				}
				oEvent.position = iScroll;
				oEvent.content_size = oContent[ options.axis ];
				oEvent.viewport_size =  oViewport[ options.axis ];
				onScroll && onScroll(oEvent)
            }
            judgeBottom(iScroll); 
        }

        function drag( event )
        {
            var pos = getXY(event);
            if( oContent.ratio < 1 )
            {
                if( options.invertscroll && touchEvents )
                {
                    iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( iMouse.start - ( sAxis ? pos.pageX : pos.pageY ) ))));
                }
                else
                {
                     iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( ( sAxis ? pos.pageX : pos.pageY ) - iMouse.start))));
                }

                iScroll = iPosition.now * oScrollbar.ratio;
                oContent.obj.css( sDirection, -iScroll  + 'px');
                oThumb.obj.css( sDirection, iPosition.now  + 'px');

				event.position = iScroll;
				event.content_size = oContent[ options.axis ];
				event.viewport_size =  oViewport[ options.axis ];
				onScroll && onScroll(event)

				judgeBottom(iScroll); 
            }
        }
        
        function end()
        {
            $( document.body ).removeClass( "noSelect" );
            if (!touchEvents){
                $( document ).unbind( 'mousemove', drag );
                $( document ).unbind( 'mouseup', end );
                oThumb.obj.unbind( 'mouseup', end );
            }
            document.ontouchmove = document.ontouchend = null;
			isDragging = false
			console.log("end?")
            //if (isOut) $(oWrapper).mouseleave();
        }
        function getXY(event){
            var pageX = event.pageX;
            var pageY = event.pageY;
            if ( event.pageX == null && event.clientX != null ) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            return { pageX : pageX, pageY : pageY  }
        }

        function $offset(elem){


                var docElem, win,
            box = { top: 0, left: 0 },
            elem = elem[ 0 ],
            doc = elem && elem.ownerDocument;

            if ( !doc ) {
                return;
            }

            docElem = doc.documentElement;

            // Make sure it's not a disconnected DOM node
            /*
            if ( !jQuery.contains( docElem, elem ) ) {
                return box;
            }
            */

            // If we don't have gBCR, just use 0,0 rather than error
            // BlackBerry 5, iOS 3 (original iPhone)
            if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
                box = elem.getBoundingClientRect();
            }
            win = doc.nodeType === 9 ?
                        doc.defaultView || doc.parentWindow :
                                    false;
            return {
                top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
                left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
            };
       }
        /*
        this.scrollToElement = function(elem, ratio){
          if (!elem) return;
          var elem_xy = $(elem).offset(),
              view_xy = $(oWrapper).offset();
          var dx = elem_xy.left - view_xy.left, dy = (elem_xy.top - view_xy.top) * (1 - ratio)
          this.update(dy, true);
      }
      */

        return initialize();
    }

   

})
.directive('scrollbar', function($parse, $timeout, $parse,$interpolate, $compile, Scrollbar){
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
            entity: null,
			overview_style: {},
			viewport_style: {},
			update_scrollbar : function(pos){
				var self = scope.$$scrollbar;
				pos = pos || "relative";
				self.init && $timeout(function(){
				    self.entity.update(pos);
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
                scope.$$scrollbar.entity = Scrollbar.init(element, options);
               // $($(element[0])).tinyscrollbar(options);
                scope.$$scrollbar.init = true;
            });
        }
		if (attr.$attr['lazyInit']){
            $timeout(function(){
                var log_event = function(e){
                    console.warn('!!!', e)
                }
                var e = 'mouseenter';
                if ('ontouchstart' in document.documentElement){
                    e = 'touchstart'
                }
                /*
                element.bind('mouseover', log_event);
                element.bind('touchstart', log_event);
                element.bind('touchmove', log_event);
                element.bind('mousemove', log_event);
                */
                element.once_bind(e, function(event){
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
