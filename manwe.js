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

var connection = function(from, to) {
    var that = {
        from: from,
        to: to
    }

    that.draw = function(ctx) {
        var fromCenter = that.from.getCenter();
        var toCenter = that.to.getCenter();
        ctx.beginPath();
        ctx.moveTo(fromCenter.x, fromCenter.y);
        ctx.lineTo(toCenter.x, toCenter.y);
        ctx.stroke();
    }
    return that;
}

var node = function(iconPath) {
	var that = {
		pos: position(0, 0)
	};

	var icon = new Image();
	icon.src = iconPath;

	that.contains = function (pos) {
		return (that.pos.x < pos.x && pos.x <= (that.pos.x + icon.width) && that.pos.y < pos.y && pos.y <= (that.pos.y + icon.height));
	};

	that.draw = function(ctx) {
		ctx.drawImage(icon, that.pos.x, that.pos.y);
	};

    that.getCenter = function() {
        var x = that.pos.x + (icon.width / 2);
        var y = that.pos.y + (icon.height / 2);
        return position(x, y);
    };
	return that;
};

var networkNode = function(iconPath) {
    var that = node(iconPath);
    return that;
};

var vnet = function() {
    var VNET_ICON = "icons/32x32/network-wired.png";
    var that = networkNode(VNET_ICON);
    return that;
};

var machineNode = function(iconPath) {
    var that = node(iconPath);
    var connections = [];

    that.connect = function(otherNode) {
        connections[connections.length] = connection(that, otherNode);
    }

    var nodeDraw = that.draw;
    that.draw = function(ctx) {
        var i;
        for (i = 0; i < connections.length; i += 1) {
            var connection = connections[i];
            connection.draw(ctx);
        }
        nodeDraw(ctx);
    }
    return that;
}

var serverNode = function() {
	var SERVER_ICON = "icons/32x32/network-server.png";
    var that = machineNode(SERVER_ICON);
    return that;
}


window.onload = function () {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var dragStart;
	var dragNode;

	var server1 = serverNode();
	var server2 = serverNode();
	var machines = [server1, server2];

    var network1 = vnet();
    var network2 = vnet();
    var networks = [network1, network2];

    server1.connect(network1);

	var draw = function() {
		ctx.clearRect(0, 0, 800, 400);
		var i;
		for (i = 0; i < machines.length; i += 1) {
			var machine = machines[i];
			machine.draw(ctx);
		}

        for (i = 0; i < networks.length; i += 1) {
            var network = networks[i];
            network.draw(ctx);
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
        var nodes = networks.concat(machines);
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
