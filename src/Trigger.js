/**
 *	@class Trigger
 *
 *	@description Trigger is a simple utility used to create events. It is similar to signals. 
 *	Triggers do not keep state, they should be therefore used for events that occur 
 *	at different time intervals but do not alter the state of the object.
 *	It can only send on type of event and it will always notify all it's listeners. 
 * 	In order to build a more robust event system, use multiple 
 *	Trigger objects as properties.
 */
var Trigger = function() {

	var t = {};

	var listeners = [];
	var lock = false;

	var lateTriggers = [];
	var lateRemovals = [];

	/**
	 *	@method on
	 *	@memberof Trigger.prototype
	 *	@description Adds a listener to this trigger
	 */
	t.on = function (callback, context) {
		callback.context = context;
		listeners.push(callback);
	};

	/**
	 *	@method off
	 *	@memberof Trigger.prototype
	 *	@description Removes a listener from this trigger. 
	 *	If the passed callback is not a listener of this trigger, 
	 *	this function will not throw any warnings, it will just return. 
	 *	If this function is called from within a function that is a listener, 
	 *	the callback will not be removed until all other listeners are called.
	 */
	t.off = function (callback) {
		var i = listeners.indexOf(callback);

		if(i == -1) return;

		if(lock) {
			lateRemovals.push({ callback: callback });
			return;
		}

		listeners.splice(i, 1);
	};

	/**
	 *	@method trigger
	 *	@memberof Trigger.prototype
	 *	@description Fires this trigger passing data as srgument to all listeners.
	 *	If this function is called from within a function that is a listener, 
	 *	the trigger will not be fired until all other listeners 
	 *	are called for the previous one.
	 */
	t.trigger = function (data) {

		if(lock) {
			lateTriggers.push({ data: data });
			return;
		}

		lock = true;

		var i = 0, nl = listeners.length;
		while(i < nl) {
			var f = listeners[i];
			f.call(f.context, data);
			i++;
		}
		
		lock = false;

		var d;
		while(d = lateTriggers.shift()) t.trigger(d.data);
		while(d = lateRemovals.shift()) t.off(d.callback);
	};

	return t;

};