function object(o) {
	function F() {}
	F.prototype = o;
	return new F();
}

function log(msg) {
    console.log(msg);
}

var position = function(x, y) {
	var that = {
		x: x,
		y: y
	};

	that.subtract = function(other) {
		var result_x = that.x - other.x;
		var result_y = that.y - other.y;
		return position(result_x, result_y);
	};

	that.add = function(other) {
		var result_x = that.x + other.x;
		var result_y = that.y + other.y;
		return position(result_x, result_y);
	};

    that.toString = function(other) {
        return "position(x=" + that.x + ", y=" + that.y + ")";
    }
	return that;
};

var node = function(iconPath) {
	var that = {
		pos: position(0, 0)
	};

	var icon = new Image();
	icon.src = iconPath;

	that.contains = function (pos) {
		return true;
		return (that.pos.x < pos.x && pos.x <= (that.pos.x + icon.width) && that.pos.y < pos.y && pos.y <= (that.pos.y + icon.height));
	};

	that.draw = function(ctx) {
		ctx.drawImage(icon, that.pos.x, that.pos.y);
	};
	return that;
};

window.onload = function () {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var SERVER_ICON = "icons/tango-icon-theme/32x32/places/network-server.png";
	var node1 = node(SERVER_ICON);
	var nodes = [node1];
	var dragStart;
	var dragNode;

	var draw = function() {
		ctx.clearRect(0, 0, 800, 400);
		var i;
		for (i = 0; i < nodes.length; i += 1) {
			var node = nodes[i];
			node.draw(ctx);
		}
	}

	var getRelativePosition = function (e) {
		// http://www.redsquirrel.com/dave/work/interactivecanvas/
		// http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
		var x = e.clientX - canvas.offsetLeft;
		var y = e.clientY - canvas.offsetTop;
		return position(x, y);
	}

	var onMouseDown = function (e) {
		pos = getRelativePosition(e);
        log("Mouse down on " + pos);
		var i;
		for (i = 0; i < nodes.length; i += 1) {
			var node = nodes[i];
			if (node.contains(pos)) {
				dragStart = pos;
				dragNode = node;
				return;
			}
		}
	}
	canvas.addEventListener("mousedown", onMouseDown, false);

	var onMouseUp = function (e) {
        log("Mouse up");
		dragStart = null;
		dragNode = null;
	}
	canvas.addEventListener("mouseup", onMouseUp, false);

	var onMouseMove = function (e) {
		if (dragNode != null) {
            log("Mouse move: drag node is " + dragNode);
			var pos = getRelativePosition(e);
			var delta = pos.subtract(dragStart);
			dragNode.pos = dragNode.pos.add(delta);
            dragStart = pos;
			draw();
		}
	}
	canvas.addEventListener("mousemove", onMouseMove, false);

	// initialise
	draw();
};
