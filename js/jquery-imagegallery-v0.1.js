/**
Created by Luis Felipe Corrêa Pérez to solve issues for BloomingDales.com
How to use:
*/
$.fn.lookbooky = function(options) {

	var defaultSettings = {
		lookbookName: 'lookbook-name',
		arrowLeftImage: 'img/arrow-left.png',
		arrowRightImage: 'img/arrow-right.png',
		slidesSelector: '.lookbook-slide',
		linksSelector: '.lookbook-links',
		slideAnimationTimeout: 500,
		analyzer: {
			createPageElementTag: function(cmCatId, cmCategory, attributes){
				console.log(pageid, categoryid);
			},
			cmCreatePageviewTag: function(cmPageID, cmCategoryID, searchTerm, searchResults){
				console.log(cmPageID, cmCategoryID, searchTerm, searchResults);
			}	
		}
	};

	var settings = $.extend(defaultSettings, options);

	//go through all lookbook on the page
	$.each(this, function(){
		var _this = $(this);
		var _slides = _this.find(settings.slidesSelector);
		var _links = _this.find(settings.linksSelector);

		_this.arrowLeft = null;
		_this.arrowRight = null;
		
		//return Current slide
		_this.getCurrentSlide = function(){
			return _this.attr('data-current-slide') || 0;
		};

		_this.setCurrentSlide = function(newCurrentSlide){
			if ( newCurrentSlide >= _slides.length){
				newCurrentSlide = 0;
			}
			else if ( newCurrentSlide < 0 ){
				newCurrentSlide = _slides.length - 1;
			}

			_this.attr('data-current-slide', newCurrentSlide);
		};

		_this.createArrows = function(){
			//create arrows ( left and right)
			_this.arrowLeft = $('<div />');
			_this.arrowLeft.addClass('arrow-left');
			_this.arrowLeft.append('<img src="' + settings.arrowLeftImage + '" />');
			_this.append(_this.arrowLeft);

			_this.arrowRight = $('<div />');
			_this.arrowRight.addClass('arrow-right');
			_this.arrowRight.append('<img src="' + settings.arrowRightImage + '" />');
			_this.append(_this.arrowRight);
		};

		_this.createArrowsListeners = function(){
			//arrow LEFT on click listener
			_this.arrowLeft.on('click', function(){
				_this.movePreviousSlide();
			});

			//arrow RIGHT on click listener
			_this.arrowRight.on('click', function(){
				_this.moveNextSlide();
			});
		};

		_this.createLinkListeners = function(){
			//links On click event - fire coremetrics attr
			_this.on('click', settings.linksSelector, function(event){
				var link = $(this);

				var coremetricsOnClick = link.attr('data-coremetrics-click');
				if ( coremetricsOnClick ){
					//call analyzer createPageElementTag
					analyzer.createPageElementTag(coremetricsOnClick, lookbookName);
				}
			});

			//links On hover event - fire coremetrics attr
			_this.on('hover', settings.linksSelector, function(event){
				var link = $(this);

				var coremetricsOnHover = link.attr('data-coremetrics-click');
				if ( coremetricsOnHover ){
					//call analyzer createPageElementTag
					analyzer.createPageElementTag(coremetricsOnHover, lookbookName);
				}
			});
		};

		_this.moveNextSlide = function(){
			var _currentSlide = _this.getCurrentSlide();
			_this.goToSlide(_currentSlide++);
		};

		_this.movePreviousSlide = function(){
			var _currentSlide = _this.getCurrentSlide();
			_this.goToSlide(_currentSlide--);
		};

		_this.goToSlide = function(newCurrentSlide, animated){
			//set true as default parameter
			animated = typeof animated === 'boolean' ? animated : true;
			var _currentSlide = _this.getCurrentSlide();
			_this.setCurrentSlide(newCurrentSlide);
			_this.animateSlide(_currentSlide, _this.getCurrentSlide(), animated);
		}

		_this.animateSlide = function(slideFrom, slideTo, animated){
			//animation timeout
			var animationTimeout = animated === true ? slideAnimationTimeout : 0;

			//equals
			if ( slideFrom === slideTo ){
				return;
			}
			//move to left
			else if ( slideFrom > slideTo){

			}
			//move to right
			else{

			}
		};

		

		_this.createArrows();
		_this.createArrowsListeners();
		_this.createLinkListeners();

		

		


	});

};