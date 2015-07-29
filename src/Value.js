/**
 *	@class Value
 *
 *	@description <p>Value is an extension of a simple property. 
 *	Properties are great to keep track of the state of on object. 
 *	For example "how many times the spaceship has been hit" or 
 *	"what is the current section on a website" or a lot of other things.
 *	A simple property can do the job well, example: "spaceship.numHits" is a number
 *	that increases each time the spacehip has been hit by enemy lasers. 
 *	Usually there will be several objects in each application that will need 
 *	to do something whenever this value chnages. To make this possible each of those
 *	objects would need to implement some sort of loop or timer and check the value of
 *	this property at regular intervals.
 *
 *	<p>This is where the Value object comes in handy. It keeps the value of the property
 *	in it's own proerty field (called 'value') but, using the object observer pattern, 
 *	each time this value chnages, it will send out a notification to every
 *	registered listener.
 */

/*
 *	Also read this http://www.html5rocks.com/en/tutorials/es7/observe/
 */
var Value = function(_value) {

	var that = this, 
		value = _value, 
		last = null;
	
	var min = null, max = null, wrap = false;

	var observers = [];

	that.observers = function() {
		return observers;
	}


	that.on = function(callback, test, param, noInitCallback) {
		var o = callback;
		o.test = test;
		o.param = param;

		// Fire the callback initially so that all values/flags of the subscriber can be adjusted at startup
		if(!noInitCallback && (!o.test || o.test(value, last))) o(value, last, param);

		observers.push(o);
		return o;
	}

	that.off = function(callback) {
		var i = observers.indexOf(callback);
		if(i > -1) observers.splice(i, 1);
	}

	that.range = function(_min, _max, _wrap) {
		min = _min;
		max = _max;
		wrap = _wrap;
		return that;
	}

	// For chaining
	that.set = function(v) {
		that.value = v;
		return that;
	}

	var changed = function() {
		var o;
		for(var i = 0, n = observers.length; i < n; i++) {
			o = observers[i];
			if(!o.test || o.test(value, last)) {
				o(value, last, o.param);
			}
		}
	}

	Object.defineProperty(this, 'value', {

		get: function() { 
			return value; 
		},

		set: function(n) { 
			if(min != null && max != null) {
				if(n < min) {
					wrap ? n = n % (max+1) : n = min;
					if(wrap) while(n < min) n += (max+1);
				}

				if(n > max) {
					wrap ? n = n % (max+1) : n = max;
					if(wrap) while(n < min) n += (max+1);
				}
			}

			if(n == value) return;

			last = value;
			value = n; 
			changed();
			// setTimeout(changed, 0);
		}

	});

	Object.defineProperty(this, 'last', {
		get: function() { 
			return last; 
		},
	});

}

