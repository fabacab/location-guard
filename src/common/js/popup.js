blog("popup loading");

Browser.init('popup');

var url;

function closePopup() {
	// delay closing to allow scripts to finish executing
	setInterval(window.close, 50);	
}

function menuAction(action) {
	switch(action) {
		case 'options':
		case 'faq':
			var anchor = action == 'options' ? '#general' : '#faq';
			Browser.gui.showOptions(anchor);

			closePopup();
			break;

		case 'hideIcon':
			Browser.storage.get(function(st) {
				st.hideIcon = true;
				Browser.storage.set(st);

				Browser.gui.refreshAllIcons();

				closePopup();
			});
			break;

		case 'pause':
			Browser.storage.get(function(st) {
				st.paused = !st.paused;
				Browser.storage.set(st);

				Browser.gui.refreshAllIcons();

				closePopup();
			});
			break;

		case 'setLevel':		// top menu, no need to do anything
			break;

		default:	// set level
			Browser.storage.get(function(st) {
				var domain = Util.extractDomain(url);
				var level = action;
				if(level == st.defaultLevel)
					delete st.domainLevel[domain];
				else
					st.domainLevel[domain] = level;
				Browser.storage.set(st);

				Browser.gui.refreshAllIcons();

				closePopup();
			});
			break;
	}
}

function drawUI() {
	// draw the menu right away (don't wait for st, url), otherwise it renders funny in chrome
	// also: for some reason the mouse gets a mouseover event when created, so it
	// highlights the first item. To avoid this, we create the menu as
	// disabled, and enable it after 50msecs
	$("#menu").menu({
		disabled: true,
		position: { my: "right bottom", at: "right bottom", of: $(window) },
		select: function(event, ui) {
			menuAction(ui.item.attr("id"));
		}
	});
	setTimeout(function() {
		$("#menu").menu({ disabled: false });
	}, 50);

	// for the remaining things we need storage and url
	Browser.gui.getActiveTabUrl(function(_url) {
	Browser.storage.get(function(st) {
		blog("popup: settings", st);

		url = _url;
		var domain = Util.extractDomain(url);
		var level = st.domainLevel[domain] || st.defaultLevel;

		$("#title").text(
			st.paused		? "Location Guard is paused" :
			level == 'real'	? "Using your real location" :
			level == 'fixed'? "Using a fixed location" :
			"Privacy level: " + level
		);
		$("#pause > a").text((st.paused ? "Resume" : "Pause") + " Location Guard");

		$("#setLevel,#hideIcon").toggle(!st.paused);

		$("body").css("height", $("#container").height());
		$("body").css("width", $("#container").width()+13);
	});
	});
}

$(document).ready(drawUI);

