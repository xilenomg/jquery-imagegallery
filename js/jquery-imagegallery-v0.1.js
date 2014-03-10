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
		slideContainerWidth: 961,
		slideContainerHeight: 638,
		analyzer: {
			createPageElementTag: function(cmCatId, cmCategory, attributes){
				console.log('COREMETRICS: createPageElementTag',cmCatId, cmCategory, attributes);
			},
			cmCreatePageviewTag: function(cmPageID, cmCategoryID, searchTerm, searchResults){
				console.log('COREMETRICS: cmCreatePageviewTag',cmPageID, cmCategoryID, searchTerm, searchResults);
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

		_this.addLookbookyClasses = function(){
			_this.addClass('lookbooky-container');
			_slides.addClass('lookbooky-slide');
			_slides.eq(0).addClass('lookbooky-slide-first');
		};
		
		//return Current slide
		_this.getCurrentSlide = function(){
			return parseInt(_this.attr('data-current-slide')) || 0;
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
				settings.analyzer.createPageElementTag(settings.lookbookName + '-arrow-left', settings.lookbookName);
				_this.movePreviousSlide();
			});

			//arrow RIGHT on click listener
			_this.arrowRight.on('click', function(){
				settings.analyzer.createPageElementTag(settings.lookbookName + '-arrow-right', settings.lookbookName);
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
					settings.analyzer.createPageElementTag(coremetricsOnClick, settings.lookbookName);
				}
			});

			//links On hover event - fire coremetrics attr
			_this.on('hover', settings.linksSelector, function(event){
				var link = $(this);

				var coremetricsOnHover = link.attr('data-coremetrics-click');
				if ( coremetricsOnHover ){
					//call analyzer createPageElementTag
					settings.analyzer.createPageElementTag(coremetricsOnHover, settings.lookbookName);
				}
			});
		};

		_this.moveNextSlide = function(){
			var _currentSlide = _this.getCurrentSlide();
			_this.goToSlide(_currentSlide+1);
		};

		_this.movePreviousSlide = function(){
			var _currentSlide = _this.getCurrentSlide();
			_this.goToSlide(_currentSlide-1);
		};

		_this.fireAnalyzerPage = function(slideNumber){
			var slide = _slides.eq(slideNumber);
			var coremetricsOnLoad = slide.attr('data-coremetrics-onload');
			if ( coremetricsOnLoad ){
				//call analyzer cmCreatePageviewTag
				settings.analyzer.cmCreatePageviewTag(coremetricsOnLoad, settings.lookbookName);
			}
		};

		_this.goToSlide = function(newCurrentSlide, animated){

			//set true as default parameter
			animated = typeof animated === 'boolean' ? animated : true;
			var _currentSlide = _this.getCurrentSlide();
			_this.setCurrentSlide(newCurrentSlide);
			_this.fireAnalyzerPage(_this.getCurrentSlide());
			_this.animateSlide(_currentSlide, _this.getCurrentSlide(), animated);
		}

		_this.animateSlide = function(slideFromNumber, slideToNumber, animated){

			//animation timeout
			var animationTimeout = animated === true ? settings.slideAnimationTimeout : 0;

			var slideFrom = _slides.eq(slideFromNumber);
			var slideTo = _slides.eq(slideToNumber);

			var slideFromLeft = 0;
			var slideToLeft = 0;

			//equals
			if ( slideFromNumber === slideToNumber ){
				return;
			}
			//move to left
			else if ( slideFromNumber < slideToNumber){
				slideTo.css('left', slideFrom.width());
				var slideFromLeft = slideFrom.width() * -1;
				var slideToLeft = 0;
			}
			//move to right
			else{
				slideTo.css('left', slideFrom.width() * -1);
				var slideFromLeft = slideFrom.width();
				var slideToLeft = 0;
			}

			slideTo.animate({
				left: slideToLeft
			}, { duration: animationTimeout, queue: false });

			slideFrom.animate({
				left: slideFromLeft
			}, { duration: animationTimeout, queue: false });

		};

		_this.initialize = function(){
			_this.addLookbookyClasses();
			_this.createArrows();
			_this.createArrowsListeners();
			_this.createLinkListeners();

			var currentSlide = _this.getCurrentSlide();
			_this.fireAnalyzerPage(currentSlide);
		}
		
		_this.initialize();
		



	});

};