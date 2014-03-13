/**
Created by Luis Felipe Corrêa Pérez to solve issues for BloomingDales.com
+55 (31) 8334-6577
How to use:
*/
$.fn.lookbooky = function(options) {

	var defaultSettings = {
		//lookbook name will be used by Analyzer ( Coremetrics )
		lookbookName: 'lookbook-name',
		//define image for left Arrow
		arrowLeftImage: 'img/arrow-left.png',
		//define image for right Arrow
		arrowRightImage: 'img/arrow-right.png',
		//jquery selector for slides
		slidesSelector: '.lookbook-slide',
		//jquery selector for links. ( We use it to call analyzer ( Coremetrics ) if they have data-coremetrics-onclick or data-coremetrics-onhover attribute)
		linksSelector: '.lookbook-links',
		//jquery selector for pagination number image
		paginatonNumberSelector: '.lookbook-pagination-img',
		//jquery selector from pagination marker image
		paginationMarkerSelector: '.lookbook-pagination-marker',
		//jquery selector for area on map into pagination div
		paginationLinksSelector: '.lookbook-pagination map area',
		//prefix to be added when user clicks on page number
		paginationAnalizerPrefix: 'topnav-',
		//slide animation timeout
		slideAnimationTimeout: 500,
		//container/slide width
		slideContainerWidth: 961,
		//container/slide height
		slideContainerHeight: 638,
		//push state values for slides. {0:'slide-pushstate-name', 1: 'slide-pushstate-name'}. Must be used with lookbookName + lookbookSeparator + pushstate value.
		pushState: {},
		//push state separator between lookbook name and pushstate value
		pushStateSeparator: '-',
		//interface for any analyzer based on coremetrics code. Can be customized must contain createPageElementTag and createPageviewTag
		analyzer: {
			createPageElementTag: function(cmCatId, cmCategory, attributes){
				console.log('COREMETRICS: createPageElementTag',cmCatId, cmCategory, attributes);
			},
			createPageviewTag: function(cmPageID, cmCategoryID, searchTerm, searchResults){
				console.log('COREMETRICS: createPageviewTag',cmPageID, cmCategoryID, searchTerm, searchResults);
			}	
		}
	};

	var settings = $.extend(defaultSettings, options);

	//go through all lookbook on the page
	$.each(this, function(){
		var _this = $(this);
		var _slides = _this.find(settings.slidesSelector);
		var _links = _this.find(settings.linksSelector);

		//pagination
		var _paginationNumber = _this.find(settings.paginatonNumberSelector);
		var _paginationMarker = _this.find(settings.paginationMarkerSelector);

		//arrows
		_this.arrowLeft = null;
		_this.arrowRight = null;

		_this.addLookbookyClasses = function(){
			_this.addClass('lookbooky-container');
			_this.width(settings.slideContainerWidth);
			_this.height(settings.slideContainerHeight);

			_slides.addClass('lookbooky-slide')
			_slides.width(settings.slideContainerWidth);
			_slides.height(settings.slideContainerHeight);
			_slides.css('left', settings.slideContainerWidth);

			_slides.eq(0).addClass('lookbooky-slide-first');
			_slides.eq(0).css('left', 0);
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
			$(window).on('hashchange', function(){
				var hash = document.location.hash;
				var slideName = getSlideNameByHash(hash);
				//get slide number
				var slideNumber = getSlideNumberByPushState(slideName);
				if ( slideNumber  ){
					//go to the slide without animation
					_this.goToSlide(slideNumber, true);
				}
			});

			//links On click event - fire coremetrics attr
			_this.on('click', settings.linksSelector, function(event){
				var link = $(this);

				var coremetricsOnClick = link.attr('data-coremetrics-onclick');
				if ( coremetricsOnClick ){
					//call analyzer createPageElementTag
					settings.analyzer.createPageElementTag(coremetricsOnClick, settings.lookbookName);
				}
			});

			//links On hover event - fire coremetrics attr
			_this.on('mouseover', settings.linksSelector, function(event){
				var link = $(this);

				var coremetricsOnHover = link.attr('data-coremetrics-onhover');
				if ( coremetricsOnHover ){
					//call analyzer createPageElementTag
					settings.analyzer.createPageElementTag(coremetricsOnHover, settings.lookbookName);
				}
			});

			_this.on('click', settings.paginationLinksSelector, function(event){
				event.preventDefault();
				var paginationIndex = $(settings.paginationLinksSelector).index(this);
				settings.analyzer.createPageElementTag(settings.paginationAnalizerPrefix + (paginationIndex + 1), settings.lookbookName);
				_this.goToSlide(paginationIndex);
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
				//call analyzer createPageviewTag
				settings.analyzer.createPageviewTag(coremetricsOnLoad, settings.lookbookName);
			}
		};

		_this.goToSlide = function(newCurrentSlide, animated){

			//set true as default parameter
			animated = typeof animated === 'boolean' ? animated : true;
			var _currentSlide = _this.getCurrentSlide();
			_this.setCurrentSlide(newCurrentSlide);
			_this.fireAnalyzerPage(_this.getCurrentSlide());
			_this.animateSlide(_currentSlide, _this.getCurrentSlide(), animated);
			_this.updatePushState(_currentSlide);
		}

		_this.animateSlide = function(slideFromNumber, slideToNumber, animated){

			//animation timeout
			var animationTimeout = animated === true ? settings.slideAnimationTimeout : 1;

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

			_this.animatePaginationMarker(slideToNumber, animated);
		};


		
		_this.animatePaginationMarker = function(slideToNumber, animated){
			//animation timeout
			var animationTimeout = animated === true ? settings.slideAnimationTimeout : 1;

			var slideToPagePosition = settings.paginationMarkerPosition[slideToNumber];

			_paginationMarker.animate({
				left: slideToPagePosition
			}, { duration: animationTimeout, queue: false });
		};

		//push state
		_this.readPushState = function(){
			var hash = document.location.hash;
			//has pushState set up
			if ( !jQuery.isEmptyObject(settings.pushState) ){
				//has lookbook name on hash
				if ( hash.indexOf(settings.lookbookName + settings.pushStateSeparator) === 1 ) {
					//verify slide name
						var slideName = getSlideNameByHash(hash);
						//get slide number
						var slideNumber = getSlideNumberByPushState(slideName);
						//go to the slide without animation
						_this.goToSlide(slideNumber, false);
				}
				
			}

		};

		_this.updatePushState = function(){
			var slideNumber = _this.getCurrentSlide();

			//has pushState set up
			if ( !jQuery.isEmptyObject(settings.pushState) ){
				
				//verify slide name
				var slideName = getSlideNameByNumber(slideNumber);
				if ( slideName ){
					//go to the slide without animation
					document.location.hash =  settings.lookbookName + settings.pushStateSeparator + slideName;
				}	
	
			}
		};

		var getSlideNumberByPushState = function(slideName){
			var slideNumberMap = $.map(settings.pushState,function(value, key){
				if ( value === slideName ){
					return key;
				}
			});

			if ( slideNumberMap.length > 0 ){
				return parseInt(slideNumberMap[0]) || null;
			}

			return null;
		};

		var getSlideNameByHash = function(hash){

			//It's 1 because of #, lookbook name length and push state separator
			return hash.substring(1 + settings.lookbookName.length + settings.pushStateSeparator.length);
		};

		var getSlideNameByNumber = function(number){

			return settings.pushState[number];
	
		};

		//initialize
		_this.initialize = function(){
			_this.readPushState();
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