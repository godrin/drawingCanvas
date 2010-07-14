jQuery.fn.mindmap = function(options) {
	// Define default settings.
	var options = jQuery.extend( {
		attract : 6,
		repulse : 2,
		damping : 0.55,
		timeperiod : 10,
		wallrepulse : 0.2,
		mapArea : {
			x : 900,
			y : 600
		},
		canvasError : 'alert',
		canvas : 'cv',
		minSpeed : 0.05,
		maxForce : 0.1,
		showSublines : true,
		updateIterationCount : 20
	}, options);

	var nodes = new Array();
	var lines = new Array();
	var activenode = null;
	var fast = false;

	// Define all Node related functions.
	function Node(index, el, parent, active) {
		this.el = el;
		this.el.spiderObj = this;
		if (active) {
			activeNode = this;
			$(this.el).addClass('active');
		}
		this.parent = parent;
		$(this.el).addClass('node');
		this.index = index;
		this.visible = true;
		this.hasLayout = true;
		this.x = Math.random() + (options.mapArea.x / 2);
		this.y = Math.random() + (options.mapArea.y / 2);
		this.el.style.left = this.x + "px";
		this.el.style.top = this.y + "px";
		this.dx = 0;
		this.dy = 0;
		this.count = 0;

		if (this.el.childNodes[0].tagName == 'A') {
			this.el.href = this.el.childNodes[0].href;
		}

		$(this.el).click(function() {
			if (activeNode)
				$(activeNode.el).removeClass('active');
			activeNode = this.spiderObj;
			$(activeNode.el).addClass('active');
			return false;
		});

		$(this.el).dblclick(function() {
			location.href = this.href;
			return false;
		});

		$(this.el).keypress(function(event) {
				if (event.keyCode == '43') {
					if(activeNode)
					  activeNode.newNode();
				}
			});
	}

	Node.prototype.normalizePosition = function() {
		// move node to root (outside of parental positioning)
		if (this.parent != null) {
			$($("#js-mindmap>ul")[1]).append(this.el);
		}
	}
	// TODO: Write this method!
	Node.prototype.layOutChildren = function() {
		// show my child nodes in an equally spaced group around myself, instead
		// of placing them randomly
	}

	Node.prototype.newNode = function() {
		var li=document.createElement("LI");
		var input=document.createElement("INPUT");
		
		$(this.el).append(li);
		$(li).append(input)
		//alert("newNode");
	}

	Node.prototype.getForceVector = function() {
		var fx = 0;
		var fy = 0;
		for ( var i = 0; i < nodes.length; i++) {
			if (i == this.index)
				continue;
			if ((options.showSublines && !nodes[i].hasLayout)
					|| (!options.showSublines && !nodes[i].visible))
				continue;
			// Repulsive force (coulomb's law)
			var x1 = (nodes[i].x - this.x);
			var y1 = (nodes[i].y - this.y);
			// adjust for variable node size
			var nodewidths = ((getSize($(nodes[i].el)).x + getSize($(this.el)).x) / 2);
			var xsign = x1 / Math.abs(x1);
			var ysign = y1 / Math.abs(y1);
			var dist = Math.sqrt((x1 * x1) + (y1 * y1));
			var theta = Math.atan(y1 / x1);
			if (x1 == 0) {
				theta = Math.PI / 2;
				xsign = 0;
			}
			// force is based on radial distance
			var f = (options.repulse * 500) / (dist * dist);
			if (Math.abs(dist) < 500) {
				fx += -f * Math.cos(theta) * xsign;
				fy += -f * Math.sin(theta) * xsign;
			}
		}
		// add repulsive force of the "walls"
		// left wall
		var xdist = this.x + getSize($(this.el)).x;
		var f = (options.wallrepulse * 500) / (xdist * xdist);
		fx += Math.min(2, f);
		// right wall
		var rightdist = (options.mapArea.x - xdist);
		var f = -(options.wallrepulse * 500) / (rightdist * rightdist);
		fx += Math.max(-2, f);
		// top wall
		var f = (options.wallrepulse * 500) / (this.y * this.y);
		fy += Math.min(2, f);
		// botttom wall
		var bottomdist = (options.mapArea.y - this.y);
		var f = -(options.wallrepulse * 500) / (bottomdist * bottomdist);
		fy += Math.max(-2, f);

		// for each line, of which I'm a part, add an attractive force.
		for ( var i = 0; i < lines.length; i++) {
			var otherend = null;
			if (lines[i].start.index == this.index) {
				otherend = lines[i].end;
			} else if (lines[i].end.index == this.index) {
				otherend = lines[i].start;
			} else
				continue;
			// Attractive force (hooke's law)
			var x1 = (otherend.x - this.x);
			var y1 = (otherend.y - this.y);
			var dist = Math.sqrt((x1 * x1) + (y1 * y1));
			var xsign = x1 / Math.abs(x1);
			var theta = Math.atan(y1 / x1);
			if (x1 == 0) {
				theta = Math.PI / 2;
				xsign = 0;
			}
			// force is based on radial distance
			var f = (options.attract * dist) / 10000;
			if (Math.abs(dist) > 0) {
				fx += f * Math.cos(theta) * xsign;
				fy += f * Math.sin(theta) * xsign;
			}
		}

		// if I'm active, attract me to the centre of the area
		if (activeNode === this) {
			// Attractive force (hooke's law)
			var otherend = options.mapArea;
			var x1 = ((otherend.x / 2) - 100 - this.x);
			var y1 = ((otherend.y / 2) - this.y);
			var dist = Math.sqrt((x1 * x1) + (y1 * y1));
			var xsign = x1 / Math.abs(x1);
			var theta = Math.atan(y1 / x1);
			if (x1 == 0) {
				theta = Math.PI / 2;
				xsign = 0;
			}
			// force is based on radial distance
			var f = (0.1 * options.attract * dist) / 10000;
			if (Math.abs(dist) > 0) {
				fx += f * Math.cos(theta) * xsign;
				fy += f * Math.sin(theta) * xsign;
			}
		}

		if (Math.abs(fx) > options.maxForce)
			fx = options.maxForce * (fx / Math.abs(fx));
		if (Math.abs(fy) > options.maxForce)
			fy = options.maxForce * (fy / Math.abs(fy));
		return {
			x : fx,
			y : fy
		};
	}

	Node.prototype.getSpeedVector = function() {
		return {
			x : this.dx,
			y : this.dy
		};
	}

	Node.prototype.updatePosition = function() {
		// apply accelerations
		var forces;
		if (fast)
			forces = {
				x : 0,
				y : 0
			};
		else {
			forces = this.getForceVector();
		}

		// $('debug1').innerHTML = forces.x;
		this.dx += forces.x * options.timeperiod;
		this.dy += forces.y * options.timeperiod;

		// TODO: CAP THE FORCES

		// this.el.childNodes[0].innerHTML = parseInt(this.dx)+'
		// '+parseInt(this.dy);
		this.dx = this.dx * options.damping;
		this.dy = this.dy * options.damping;

		// TODO: ADD MINIMUM SPEEDS
		if (Math.abs(this.dx) < options.minSpeed)
			this.dx = 0;
		if (Math.abs(this.dy) < options.minSpeed)
			this.dy = 0;
		// apply velocity vector
		this.x += this.dx * options.timeperiod;
		this.y += this.dy * options.timeperiod;
		this.x = Math.min(options.mapArea.x, Math.max(1, this.x));
		this.y = Math.min(options.mapArea.y, Math.max(1, this.y));
		// only update the display after the thousanth iteration, so it's not
		// too wild at the start
		this.count++;
		// if (this.count<updateDisplayAfterNthIteration) return;
		// display
		var showx = this.x; // - (getSize($(this.el)).x / 2);
		var showy = this.y; // - (getSize($(this.el)).y / 2);
		showx -= 20;
		showy -= 20;
		this.el.style.left = showx + "px";
		this.el.style.top = showy + "px";
	}

	// Define all Line related functions.
	function Line(index, startSpiderNode, finSpiderNode) {
		this.index = index;
		this.start = startSpiderNode;
		this.colour = "blue";
		this.size = "thick";
		this.end = finSpiderNode;
		this.count = 0;
	}

	Line.prototype.updatePosition = function() {
		if (options.showSublines
				&& (!this.start.hasLayout || !this.end.hasLayout))
			return;
		if (!options.showSublines && (!this.start.visible || !this.end.visible))
			return;
		if (this.start.visible && this.end.visible)
			this.size = "thick";
		else
			this.size = "thin";
		if (activeNode.parent == this.start || activeNode.parent == this.end)
			this.colour = "red";
		else
			this.colour = "blue";
		switch (this.colour) {
		case "red":
			ctx.strokeStyle = "rgb(100, 0, 0)";
			break;
		case "blue":
			ctx.strokeStyle = "rgb(0, 0, 100)";
			break;
		}
		switch (this.size) {
		case "thick":
			ctx.lineWidth = "3";
			break;
		case "thin":
			ctx.lineWidth = "1";
			break;
		}
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		if (false)
			ctx.lineTo(this.end.x, this.end.y);
		else
			ctx
					.quadraticCurveTo(((this.start.x + this.end.x) / 1.8),
							((this.start.y + this.end.y) / 2.4), this.end.x,
							this.end.y);
		ctx.stroke();
		ctx.closePath();
	}

	// Define all Loop related functions.
	function Loop() {
		// return;
		// alert("loop");
		if (!fast)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		// update node positions
		// alert(nodes.length);
		for ( var i = 0; i < nodes.length; i++) {
			// TODO: replace this temporary idea
			var childActive = false;
			var currentNode = activeNode;
			while (currentNode.parent && (currentNode = currentNode.parent)) {
				if (currentNode == nodes[i])
					childActive = true;
			}
			if (childActive || activeNode == nodes[i]
					|| activeNode == nodes[i].parent) {
				nodes[i].visible = true;
				nodes[i].hasLayout = true;
			} else {
				nodes[i].visible = false;
				if (nodes[i].parent && nodes[i].parent.parent
						&& nodes[i].parent.parent == activeNode) {
					nodes[i].hasLayout = true;
				} else {
					nodes[i].hasLayout = false;
				}
			}
			if (nodes[i].visible) {
				nodes[i].el.style.display = "block";
			} else {
				nodes[i].el.style.display = "none";
			}
			if ((options.showSublines && !nodes[i].hasLayout)
					|| (!options.showSublines && !nodes[i].visible))
				continue;
			nodes[i].updatePosition();
		}
		// display lines
		// alert(lines.length);
		for ( var i = 0; i < lines.length; i++) {
			lines[i].updatePosition();
		}
	}

	// Define all List related functions.
	function addList(ul, parent) {
		var mylis = ul.childNodes;
		var thislist = [];
		var linecounter = 0;
		for ( var li = 0; li < mylis.length; li++) {
			if (mylis[li].tagName != 'LI')
				continue;
			var nodeno = nodes.length;
			nodes[nodeno] = new Node(nodeno, mylis[li], parent);

			thislist[thislist.length] = nodes[nodeno];
			var mylicontent = mylis[li].childNodes;
			for ( var i = 0; i < mylicontent.length; i++) {
				if (mylicontent[i].tagName != 'UL')
					continue;
				addList(mylicontent[i], nodes[nodeno]);
			}

			if (parent != null) {
				var lineno = lines.length;
				lines[lineno] = new Line(lineno, nodes[nodeno], parent);
			}
		}
	}

	function addNode(content) {
		alert(content);
	}

	function getSize(el) {
		var ret = {};
		ret.x = el.outerHeight();
		ret.y = el.outerWidth();
		return ret;
	}

	return this.each(function() {
		if (typeof window.CanvasRenderingContext2D == 'undefined'
				&& typeof G_vmlCanvasManager == 'undefined') {
			if (options.canvasError === "alert") {
				alert("ExCanvas was not properly loaded.");
			} else if (options.canvasError === "console") {
				console.log("ExCanvas was not properly loaded.");
			} else {
				options.canvasError();
			}
		} else {
			var myroot = $("#js-mindmap a")[0];
			// create a misc UL to store flattened nodes
			var miscUL = document.createElement("UL");
			$('#js-mindmap').append(miscUL);

			var nodeno = nodes.length;
			nodes[nodeno] = new Node(nodeno, myroot, null, true);

			var myul = $("#js-mindmap ul")[0];
			alert(this.id);
			addList(myul, nodes[nodeno]);
			for ( var i = 0; i < nodes.length; i++) {
				nodes[i].normalizePosition();
			}

			setInterval(Loop, 40);

			$('#js-mindmap').addClass('js-mindmap');

			// CANVAS
			canvas = document.getElementById(options.canvas);
			ctx = canvas.getContext("2d");
			ctx.lineWidth = "2";
			ctx.strokeStyle = "rgb(100, 100, 100)";
		}
	});
};