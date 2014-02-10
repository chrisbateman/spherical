/* global Impetus */

(function() {
	var Spherical = function(cfg) {
		'use strict';
		
		var _container;
		var _cube;
		var _cubeZ;
		var _cubeRotateX = 0;
		var _cubeRotateY = 0;
		var _imp;
		var _enableFullscreen = true;
		var _isFullscreen = false;
		var _fsButton;
		var _supportsFullscreenAPI = !!document.webkitCancelFullScreen || !!document.mozCancelFullScreen || !!document.cancelFullScreen;
		var _fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;
		var _cubeTemplate = '<div class="spherical-cube"><div class="spherical-front" style="background-image:url({{fImg}});"></div><div class="spherical-back" style="background-image:url({{bImg}});"></div><div class="spherical-left" style="background-image:url({{lImg}});"></div><div class="spherical-right" style="background-image:url({{rImg}});"></div><div class="spherical-top" style="background-image:url({{uImg}});"></div><div class="spherical-bottom" style="background-image:url({{dImg}});"></div></div>';
		
		/**
		 * @return {boolean} whether the browser supports preserve-3d
		 */
		var _supportsPreserve3d = (function() {
			var properties = [
				'transformStyle',
				'webkitTransformStyle',
				'MozTransformStyle'
			];
			var testElem = document.createElement('div');
			for (var i=0; i<properties.length; i++) {
				if (testElem.style[properties[i]] !== undefined) {
					testElem.style[properties[i]] = 'preserve-3d';
					if (testElem.style[properties[i]] === 'preserve-3d') {
						return true;
					}
				}
			}
			return false;
		})();
		
		/**
		 * simple templating
		 * @param  {string} template
		 * @param  {object} data
		 * @return {string}
		 */
		var _template = function(template, data) {
			return template.replace(/\{\{([\w]+)\}\}/ig, function(a, b) {
				return data[b] || '';
			});
		};
		
		/**
		 * sets the current transform values
		 */
		var _updateCubeTransform = function() {
			_cube.style.webkitTransform = _cube.style.transform = 'translate3d(0, 0, '+_cubeZ+'px) rotateX('+_cubeRotateY+'deg) rotateY('+(-_cubeRotateX)+'deg)';
		};
		
		/**
		 * sets the current perspective
		 */
		var _updatePerspective = function() {
			_container.style.webkitPerspective = _container.style.perspective = _cubeZ + 'px';
		};
		
		/**
		 * clamps and sets the z value
		 * @param {number} z
		 */
		var _setCubeZ = function(z) {
			_cubeZ = Math.max(Math.min(1500, z), 130);
			_updateCubeTransform();
			_updatePerspective();
		};
		
		/**
		 * calculates the z value
		 * @param  {number} amt
		 */
		var _increaseZoom = function(amt) {
			amt /= 15;
			amt = ((0.2 * _cubeZ) - 8.2) * amt;
			
			amt = _cubeZ + amt;
			
			_setCubeZ(amt);
		};
		
		/**
		 * initializes zooming behavior
		 */
		var _addZoomControls = function() {
			var _onScroll = function(ev) {
				ev.preventDefault();
				var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.deltaY)));
				_increaseZoom(delta * 15);
			};
			
			_container.addEventListener('wheel', _onScroll);
			
			// NEEDS WORK
			if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
				var _lastScale = 1;
				var _onGestureChange = function(ev) {
					_increaseZoom((ev.scale - _lastScale) * 50);
					_lastScale = ev.scale;
				};
				document.body.addEventListener('gesturestart', function(e) {
					_imp.pause();
					_lastScale = 1;
				});
				document.body.addEventListener('gesturechange', _onGestureChange);
				document.body.addEventListener('gestureend', function(e) {
					_imp.unpause();
				});
			}
		};
		
		/**
		 * cross-browser requestFullscreen
		 * @param  {Element} node
		 */
		var _requestFullscreen = function(node) {
			if (node.requestFullscreen ) {
				node.requestFullscreen();
			} else if (node.mozRequestFullScreen ) {
				node.mozRequestFullScreen();
			} else if (node.webkitRequestFullScreen ) {
				node.webkitRequestFullScreen();
			}
		};
		
		/**
		 * cross-browser exitFullscreen
		 */
		var _exitFullscreen = function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		};
		
		/**
		 * toggles current fullscreen state
		 * @public
		 */
		this.toggleFullscreen = function() {
			if (_isFullscreen) {
				if (_supportsFullscreenAPI) {
					_exitFullscreen();
				} else {
					_container.className = 'spherical-container';
					_isFullscreen = !_isFullscreen;
				}
			} else {
				if (_supportsFullscreenAPI) {
					_requestFullscreen(_container);
					_fsButton.style.display = 'none';
				} else {
					_container.className = 'spherical-container spherical-pseudo-fs';
					_isFullscreen = !_isFullscreen;
				}
			}
			
		};
		
		/**
		 * called when fullscreen status changes
		 */
		var _onFullscreenChange = function() {
			this.resetZ();
			_isFullscreen = !_isFullscreen;
			
			if ((!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) && _supportsFullscreenAPI) {
				_fsButton.style.display = '';
			}
		}.bind(this);
		
		/**
		 * sets the z value based on the container size
		 * @public
		 */
		this.resetZ = function() {
			_cubeZ = (Math.sqrt(_container.clientWidth * _container.clientHeight) / 2.5);
			
			_updateCubeTransform();
			_updatePerspective();
		};
		
		
		(function init() {
			if (!_supportsPreserve3d) return;
			
			if (cfg.enableFullscreen === false) _enableFullscreen = false;
			_container = (typeof cfg.container === 'string') ? document.querySelector(cfg.container) : cfg.container;
			
			_container.classList.add('spherical-container');
			_container.innerHTML = _template(_cubeTemplate, {
				fImg: cfg.front,
				bImg: cfg.back,
				lImg: cfg.left,
				rImg: cfg.right,
				uImg: cfg.top,
				dImg: cfg.bottom
			});
			
			_cube = _container.querySelector('.spherical-cube');
			
			this.resetZ();
			
			
			_imp = new Impetus({
				source: _cube,
				boundY: [-90, 90],
				multiplier: 0.2,
				update: function(x, y) {
					_cubeRotateX = x;
					_cubeRotateY = y;
					_updateCubeTransform();
				}
			});
			
			_addZoomControls();
			
			if (_enableFullscreen && _supportsFullscreenAPI && _fullscreenEnabled) {
				_fsButton = document.createElement('button');
				_fsButton.className = 'spherical-fullbutton';
				_fsButton.onclick = this.toggleFullscreen;
				_container.appendChild(_fsButton);
				
				document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.onfullscreenchange = _onFullscreenChange;
			}
			
		}).bind(this)();
	};
	
	
	if (typeof define === "function" && define.amd) {
		define('spherical', ['impetus'], Spherical);
	} else if (typeof module === "object" && module.exports) {
		module.exports = Spherical;
	} else {
		this.Spherical = Spherical;
	}
	
})();