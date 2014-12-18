!function() {
	var omega3 = {
		version: "0.1"
	};

	if (typeof(d3) == "undefined") {
		throw "d3 is not defined. This library is required.";
	};

	omega3.baseClass = "omega3"

	omega3.legend = function (svg, allowSearch, size) {
		var defaultShape = 'rect';
		var items = {};
		var legendPadding = 22;
		var legendArea = size || 150;
		svg.select(".omega3-legend").remove();
		
			  //.call(omega3.legend);
		
		svg.selectAll("[omega3-legend-data]").each(function() {
			var self = d3.select(this)
			items[self.attr("omega3-legend-data")] = {
			  pos : self.attr("omega3-legend-pos") || this.getBBox().y,
			  color : self.attr("omega3-legend-color") != undefined ? self.attr("omega3-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke"),
			  shape : self.attr("omega3-legend-shape") || defaultShape
			}
		  })
	 
		items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})
		length = items.length;

		var x =  svg.attr('width') - legendArea + 30;
		var y = svg.attr('height') - 30 - (allowSearch ? 30 : 0) - legendPadding*items.length;
		g = svg.append("g")
			  .attr("class","omega3-legend")
			  .attr("transform","translate(" + x + ", " + y + ")")
			  .style("font-size","12px");

		g.each(function() {
			var g= d3.select(this),
				lb = g.selectAll(".omega3-legend-box").data([true]),
				li = g.selectAll(".omega3-legend-items").data([true])
		 
			lb.enter().append("rect").classed("omega3-legend-box",true)
			li.enter().append("g").classed("omega3-legend-items",true)
		

			var highlightRecord = [];
			
			var mouseover = function (d) {
				highlightRecord = [];
				svg.selectAll(".omega3-data-point").each(function(){
					
					var self = d3.select(this);
					var legendName = self.attr("omega3-legend-data");
					
					highlightRecord.push({node:self, opacity: self.attr("opacity") || 1});
					if (d.key == legendName) {
						self.attr("opacity", 1);
					} else {
						self.attr("opacity", 0.2);
					}
				})
			};

			var mouseleave = function () {
				highlightRecord.forEach(function(entry) {
					entry.node.attr("opacity", entry.opacity);
				});
			}

			var text = li.selectAll("text")
				.data(items,function(d) { return d.key});
			
			text
				.enter()
				.append("text")
				.attr("y",function(d,i) { return (i*2)+"em"})
				.attr("x","1em")
				.text(function(d) { ;return d.key})
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)
			
			text.exit().remove();
			
			var circles = li.selectAll("circle")
				.data(items.filter(function(item, index) { 
						// save original index
						item.value.index = index;
						return item.value.shape == 'circle'
					}),
					function(d) { return d.key}
				);
			
			circles.enter()
				.append('circle')
				.attr("cy",function(d) { return (d.value.index*2)-0.25+"em"})
				.attr("cx",0)
				.attr("r","0.5em")
				.style("fill",function(d) { return d.value.color})  
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave);

			circles.exit().remove();

			var lines = li.selectAll("line")
				.data(items.filter(function(item, index) { 
						// save original index
						item.value.index = index;
						return item.value.shape == 'line'
					}),
					function(d) { return d.key});
			lines.enter()
				.append('line')
				.attr("x1", "-0.4em")
				.attr("x2", "0.4em")
				.attr("y1", function(d) { return ((d.value.index*2)-0.4)+"em"})
				.attr("y2", function(d) { return ((d.value.index*2)-0.4)+"em"})
				.attr("stroke-width", 2)
				.attr("stroke", function(d) { return d.value.color})
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave);

			lines.exit().remove()

			var rects = li.selectAll("rect")
				.data(items.filter(function(item, index) { 
						// save original index
						item.value.index = index;
						return item.value.shape == 'rect'
					}),
					function(d) { return d.key});
			rects.enter()
				.append('rect')
				.attr("x", "-0.4em")
				.attr("width", "0.8em")
				.attr("y", function(d,i) { return (d.value.index*2)-0.8+"em"})
				.attr("height", "0.8em")
				.style("fill",function(d) { return d.value.color})
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave);  

			rects.exit().remove()

			// Reposition and resize the box
			var lbbox = li[0][0].getBBox()  
			lb.attr("x",(lbbox.x-legendPadding))
				.attr("y",(lbbox.y-legendPadding))
				.attr("height",(lbbox.height+2*legendPadding))
				.attr("width",(lbbox.width+2*legendPadding))
		  });
		return g;
	};

	omega3.tooltip = function (tooltipFunctions, tooltipHeader) {

		return function (g) {

			var svg = d3.select(g.property("nearestViewportElement"));
			var colour = g.attr("omega3-legend-color") != undefined ? g.attr("omega3-legend-color") : g.style("fill") != 'none' ? g.style("fill") : g.style("stroke");
			var shape = g.attr("omega3-legend-shape") || "rect";

			g.on("mouseover",function(d,i) { 
				
				var titleWidth =  8 * d3.max(tooltipFunctions, function (t) {return t.title.length;});
				var contentWidth =  8 * d3.max(tooltipFunctions, function (t) {
					return t.contentFunction(d).toString().length;
				});
				
				var minWidth = 10 + titleWidth + 15 + contentWidth + 15;

				if (tooltipHeader) {
					var headerWidth = 10 * tooltipHeader(d).toString().length + 20;
					minWidth = Math.max(minWidth, headerWidth);
				}
				var el = d3.select(this)
				 
				//el.style("stroke", colour).style("stroke-width",4);
				var parentWidth = svg.attr("width");
				// if (this.parentNode.width && this.parentNode.width.baseVal && this.parentNode.width.baseVal.value) {
				// 	parentWidth = this.parentNode.width.baseVal.value;
				// }
				var tooltipWidth = Math.max(60, minWidth);
				var textSpacing = 22;
				var tooltipHeight = (tooltipHeader ? 25 : 10) +
									textSpacing * tooltipFunctions.length + 15;
				
				var lines = 0;
				var x = el.attr('x') || el.attr('cx') || el.attr('dx');  
				var y = el.attr('y') || el.attr('cy') || el.attr('dy');  
				var xCoord = +x - tooltipWidth/2;
				var yCoord = +y - d.radius - tooltipHeight - 5;

				if (yCoord < 0) {
					yCoord = +el.attr('cy') + d.radius + 5
				} 
				if (xCoord < 0) {
					xCoord = 0;
				} else if (parentWidth && xCoord + tooltipWidth > parentWidth) {
					xCoord = parentWidth - tooltipWidth;
				}

				tooltip = svg
					.append('g')
					.attr("class", "omega3-tooltip")
					.attr("transform", "translate(" + xCoord + ", " + yCoord +")");

				tooltip
					.append('rect')
					.attr("x",0)
					.attr("y",0)
					.attr("width", tooltipWidth)
					.attr("height", tooltipHeight)
					.attr("fill", "#FFF")
					.attr("stroke", "lightgray")
					.attr("filter","url(#omega3-dropshadow)")
					.attr("opacity", 0.9);

				if (tooltipHeader) {
					tooltip.append("rect")
						.attr("class", "omega3-tooltip-header-background")
						.attr("fill" , "#EFEFEF")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", tooltipWidth)
						.attr("height",  (textSpacing) + 10);

					tooltip.append("text")
						.attr("color", "black")
						.attr("class", "omega3-tooltip-header")
						.attr("y", (textSpacing * lines++) + 25)
						.attr("x", tooltipWidth/2)
						.attr("text-anchor", "middle")
						.text(tooltipHeader(d))

					tooltip.append("line")
						.attr("class", "omega3-tooltip-header-border")
						.attr("stroke" , "#EFEFEF")
						.attr("stroke-width" , 1)
						.attr("x1", 0)
						.attr("x2", tooltipWidth)
						.attr("y1",  (textSpacing * lines) + 10)
						.attr("y2",  (textSpacing * lines) + 10);
				}

				tooltipFunctions.forEach(function (t) {
					tooltip.append("text")
						.attr("class", "omega3-tooltip-data-title")
						.attr("color", "black")
						.attr("x", 10)
						.attr("y", (textSpacing * lines) + 30)
						.style("font-weight", 600)
						.text(t.title);

					tooltip.append("text")
						.attr("class", "omega3-tooltip-data-content")
						.attr("color", "black")
						.attr("x", titleWidth + 15)
						.attr("y", (textSpacing * lines) + 30)
						.text(t.contentFunction(d));

					lines++;
				});
				
			})
			.on("mouseout",function(d,i) { 
				d3.select(this)
				  //.style("stroke-width",0)
				  //.style("stroke", function(d){ return that.getStrokeColor(d); })
				d3.selectAll(".omega3-tooltip").remove()
			});
		};
	};

	omega3.colours = function () {
		var colours = [
			"rgb(31,119,180)",
			"rgb(255,127,14)",
			"rgb(44,160,44)",
			"rgb(214,39,40)",
			"rgb(148,103,189)",
			"rgb(140,86,75)",
			"rgb(227,119,194)",
			"rgb(127,127,127)",
			"rgb(188,189,34)",
			"rgb(23,190,207)"
		];
		return colours;
	};

	omega3.successColour = "rgb(44,160,44)";
	omega3.failColour = "rgb(214,39,40)";

	omega3.search = function(nodesList, searchString) {
		for (nodesKey in nodesList) {
			var nodes = nodesList[nodesKey];
			if (nodes) {
				nodes
					.attr("opacity", function (d) {
						var highlight = false;

						if (searchString == "") {
							highlight = true;
						} else {
							for (key in d) {
								var stringAttr = d[key] + "";
								var numberAttr = +stringAttr;
								var searchNumber = +searchString;
								if (isNaN(numberAttr) || isNaN(searchNumber)) {
									if (~stringAttr.toLowerCase().indexOf(searchString.toLowerCase())) {
										highlight = true;
										break;
									}
								} else {
									highlight = numberAttr == searchNumber;
									break;
								}
								
							}
						}

						return highlight ? 1 : 0.2;
					})
			}
		}
		return true;
	};

	omega3.addSearch = function (selector, nodesList, top, left, width) {
		d3.select(selector + " .omega3-search").remove()
		d3.select(selector)
			.append("form")
			.attr("class", "omega3-search omega3-extras")
			.style("top", (top || 0) + "px")
			.style("left", (left || 0) + "px")
			.append("input")
			.attr("class", "search")
			.attr("type", "text")
			.attr("placeholder", "Search...")
			.style("border", "none")
			.style("text-align", "center")
			.style("width", (width || 0) + "px")
			.on("input", function () {
				omega3.search(nodesList,this.value);
			});
	};

	omega3.clone = function (obj) {
		var copy;

		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = this.clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	};

	omega3.addShadowDef = function(svg) {

		var filter = svg.append("defs")
			.append("filter")
			.attr("id", "omega3-dropshadow")
			.attr("x", "-40%")
			.attr("y", "-40%")
			.attr("width", "200%")
			.attr("height", "200%");
		
		filter.append("feOffset")
			.attr("dx", 3)
			.attr("dy", 4)
			.attr("in", "SourceAlpha")
			.attr("result", "offOut");

		filter.append("feGaussianBlur")
			.attr("in", "offOut")
			.attr("stdDeviation", 4)
			.attr("result","blurOut");

		filter.append("feBlend")
			.attr("in", "SourceGraphic")
			.attr("in2", "blurOut")
			.attr("mode","normal");

		var f2 = svg.append("defs")
			.append("filter")
			.attr("id", "omega3-dropshadow-1")
			.attr("x", "-40%")
			.attr("y", "-40%")
			.attr("width", "200%")
			.attr("height", "200%");
		
		f2.append("feOffset")
			.attr("dx", 1)
			.attr("dy", 2)
			.attr("in", "SourceAlpha")
			.attr("result", "offOut");

		f2.append("feGaussianBlur")
			.attr("in", "offOut")
			.attr("stdDeviation", 2)
			.attr("result","blurOut");

		f2.append("feBlend")
			.attr("in", "SourceGraphic")
			.attr("in2", "blurOut")
			.attr("mode","normal");
	

	}
	omega3.drag = function(force, tick) {
		
		var dragstarted = function(v) {
		  force.stop();
		  this.parentNode.appendChild(this);
		  var node = d3.select(this);
		  var currentRadius = v.radius || element.attr("r");
		  v.radius = currentRadius * 1.2;
		  node
		  	  .attr("filter", "url(#omega3-dropshadow)")
		  	  .transition()
		      .ease("elastic")
		      .duration(500)
		      .attr("r", function (d) {return d.radius;});
		}

		var dragged = function (d) {
		  
		  d.x = d3.event.x;
		  d.y = d3.event.y;
		  var node = d3.select(this)
		  switch (this.tagName) {
		  	case "circle":
		  		node.attr("cx", function (d) { return d.x })
		  			.attr("cy", function (d) { return d.y })
		  		break;
		  	case "rect":
		  		node.attr("x", function (d) { return d.x })
		  			.attr("y", function (d) { return d.y })
		  		break
		  }
		  // var tickCaller = function () {
		  // 		this.alpha = force.alpha();
		  // 		return this;
		  // };

		  //tickCaller().call(tick);
		  for (var i = 0; i < 100; i++) {
		  	tick({alpha:force.alpha()})
		  }
		  
		}

		var dragended = function(v) {
		  force.start();
		  var currentRadius = v.radius || element.attr("r");
		  v.radius = currentRadius / 1.2;
		  d3.select(this)
		  	  .attr("filter", "")
		  	  .transition()
		      .ease("elastic")
		      .duration(500)
		      .attr("r", function (d) {return d.radius;});
		}


		var drag = d3.behavior.drag()
				    //.origin(function(d) { return {x: d[0], y: d[1]}; })
				    .on("dragstart", dragstarted)
				    .on("drag", dragged)
				    .on("dragend", dragended);

		return function (g) {
			g
			// .on("dragstart", function (d) {
			// 	var element = d3.select(this);
			// 	var currentRadius = d.radius || element.attr("r");
			// 	if (currentRadius) {
			// 		d.radius = currentRadius * 1.1;
			// 		element.attr("r", function (d) {return d.radius;});
			// 	}
			// })
			// .on("dragend", function (d) {
			// 	var element = d3.select(this);
			// 	var currentRadius = d.radius || element.attr("r");
			// 	if (currentRadius) {
			// 		d.radius = currentRadius / 1.1;
			// 		element.attr("r", function (d) {return d.radius;});
			// 	}
			// })
			.call(drag);
		}
	}

	omega3.circleHover = function (g) {
		g.on("mouseover", function (v,i) {
			var node = d3.select(this);
			var currentRadius = v.radius || element.attr("r");
			v.radius = currentRadius;
			v._temp_radius = currentRadius * 1.2;
			node
			  	  .attr("filter", "url(#omega3-dropshadow)")
			  	  .transition()
			      .ease("elastic")
			      .duration(500)
			      .attr("r", function (d) {return d._temp_radius;});
		})
		.on("mouseleave", function (v,i) {
			// var currentRadius = v.radius || element.attr("r");
			// v.radius = currentRadius / 1.2;
			d3.select(this)
			  	  .attr("filter", "")
			  	  .transition()
			      .ease("elastic")
			      .duration(500)
			      .attr("r", function (d) {return d.radius;});
		})
	};

	// omega3.circleExit = function (v,i) {
	// 	var currentRadius = v.radius || element.attr("r");
	// 	v.radius = currentRadius / 1.2;
	// 	d3.select(this)
	// 	  	  .attr("filter", "")
	// 	  	  .transition()
	// 	      .ease("elastic")
	// 	      .duration(500)
	// 	      .attr("r", function (d) {return d.radius;});
	// }

	omega3.correlate = function (dataset, xColumn, yColumn) {
		var xMean = d3.mean(dataset, function(d) {return d[xColumn];});
		var yMean = d3.mean(dataset, function(d) {return d[yColumn];});
		var xy =0;
		var x2 = 0;
		var y2 = 0;
		dataset.forEach(function (d) {
			var x = +d[xColumn];
			var y = +d[yColumn]
			xy += x * y;
			x2 += x * x;
			y2 += y * y;
		});

		return xy / Math.sqrt(x2*y2);
	};

	omega3.generate = function(config) {
		
		switch (config.type) {
			case "floating-bubble" : 
				var primaryLayer = config.layers[0];
				var chart = omega3.floatingBubble(config.data)
								.setBinding(config.selector)
								.yAxisValue(primaryLayer.y.value)
								.setYLabel(primaryLayer.y.label)
								.setYFormat(d3.format(primaryLayer.y.format));

				if (primaryLayer.tooltip) {
					if (primaryLayer.tooltip.title) {
						chart.setTooltipHeaderValue(primaryLayer.tooltip.title)
					}
					primaryLayer.tooltip.values.forEach(function (v) {
						chart.addTooltipValue(v.title, v.value, v.format);
					})
				}
				if (primaryLayer.colour) {
					chart.setColourFunction(primaryLayer.colour);
				}
				if (primaryLayer.legend) {
					chart.setLegendFunction(primaryLayer.legend);
				}

				return chart.init();
			case "scatter" : 
				break;
			case "composite" : 
				break;
		}
		return false;
	};

	omega3.baseChart = function (jsonData) {
		var chart = {};
		chart.data = jsonData;
		chart.nodes = [];
		chart.bindingSelector = "body";
		chart.width = 200;
		chart.height = 400;
		chart.success = omega3.successColour;
		chart.fail = omega3.failColour;
		chart.customSize = false;
		chart.padding = 30;
		chart.colours = omega3.colours();
		chart.showLegend = true;
		chart.legendArea = 150;
		chart.allowSearch = true;
		chart.tooltipFunctions = [];
		chart.tooltipHeader = null;
		chart.legendFunction = null;
		chart.yFormat = d3.format(",.2f");
		chart.xFormat = null;
		chart.xAccessor = null;
		chart.xColumn = null;
		chart.yAccessor = null;
		chart.yColumn = null;
		chart.radiusAccessor = null;
		chart.radiusColumn = null;
		chart.xAxis = null;
		chart.yAxis = null;
		chart.xRange = null;
		chart.yRange = null;
		chart.setBinding = function (selector) {
			chart.bindingSelector = selector;
			return this;
		};

		chart.xAxisValue = function (xColumn) {
			chart.xColumn = xColumn;
			chart.xAccessor = function (d) { return d[xColumn]};
			return this;
		};

		chart.yAxisValue = function (yColumn) {
			chart.yColumn = yColumn;
			chart.yAccessor = function (d) { return d[yColumn]};
			return this;
		};

		chart.radiusValue = function (radiusColumn) {
			chart.radiusColumn = radiusColumn;
			chart.radiusAccessor = function (d) { return d[radiusColumn]};
			return this;
		}

		chart.setXFormat = function (formatFunction) {
			chart.xFormat = formatFunction;
			return this;
		};

		chart.setYFormat = function (formatFunction) {
			chart.yFormat = formatFunction;
			return this;
		};

		chart.setYLabel = function (titleString) {
			chart.yTitle = titleString;
			return this;
		};

		chart.setXLabel = function (titleString) {
			chart.xTitle = titleString;
			return this;
		};

		chart.setTooltipHeaderValue = function(headerAccessor) {
			chart.tooltipHeader = function (d) { return d[headerAccessor]; }
			return this;
		};

		chart.addTooltipValue = function(title, valueColumn, format) {
			if (!format) {
				format = function (d) { return d; };
			}
			chart.tooltipFunctions.push({
					title: title,
					contentFunction: function (d) {return format(d[valueColumn]);}
			})	
			return this;
		}

		chart.setCustomLegendFunction = function (legendFunction) {
			chart.legendFunction = legendFunction;
			return this;
		};

		return chart;
	}

	omega3.trendSpark = function(jsonData) {
		var trendSpark = new omega3.baseChart(jsonData);
		trendSpark.chartClass = "omega3-trend-spark";
		trendSpark.width = 300;
		trendSpark.height = 300;
		trendSpark.easeMethod = "cubic";
		trendSpark.interpolated = true;
		trendSpark.xFormat = d3.time.format("%d/%m/%Y");

		trendSpark.init = function(resize) {
			if (!(trendSpark.yAccessor && trendSpark.xAccessor)) {
				throw "Mandatory values not set. All values must be set (yAxisValue, xAxisValue)";
			}

			d3.select(trendSpark.bindingSelector + ' svg').remove();

			var lastValue = trendSpark.data[trendSpark.data.length-1];
			var secondLastValue = trendSpark.data[trendSpark.data.length-2];
			var trend = trendSpark.yAccessor(lastValue) >= trendSpark.yAccessor(secondLastValue);

			trendSpark.xRange = d3.scale
				.linear()
				.domain(
					[
						Math.min(1,d3.min(trendSpark.data, trendSpark.xAccessor)),
						Math.max(1,d3.max(trendSpark.data, trendSpark.xAccessor))
					]
				)
				.range([0, trendSpark.width]);

			trendSpark.yRange = d3.scale
				.linear()
				.domain(
					[
						Math.min(1,d3.min(trendSpark.data, trendSpark.yAccessor)),
						Math.max(1,d3.max(trendSpark.data, trendSpark.yAccessor))
					]
				)
				.range([trendSpark.height-trendSpark.padding, trendSpark.height/2]);

			
			var line = d3.svg.line()
			    .x(function(d) { return trendSpark.xRange(trendSpark.xAccessor(d)); })
			    .y(function(d) { return trendSpark.yRange(trendSpark.yAccessor(d)); });

			if (trendSpark.interpolated) {
				line.interpolate('cardinal');
			}

			var svg = d3.select(trendSpark.bindingSelector)
				.append('svg')
				.attr("width", trendSpark.width)
				.attr("height", trendSpark.height)
				.classed(omega3.baseClass, true)
				.classed(trendSpark.chartClass, true)
				.call(omega3.addShadowDef);

			var path = svg.append("path")
		      .datum(trendSpark.data)
		      .attr("class", "omega3-line-chart")
		      .attr("stroke", trend ? trendSpark.success : trendSpark.fail)
		      .attr("filter","url(#omega3-dropshadow-1)")
		      .attr("d", line);
				

			var totalLength = path.node().getTotalLength();

		    path.attr("stroke-dasharray", totalLength + " " + totalLength)
				 .attr("stroke-dashoffset", totalLength)
				 .transition()
				 .duration(2000)
				 .ease(trendSpark.easeMethod)
				 .attr("stroke-dashoffset", 0);

			

			var trendY = trendSpark.height/3 + 10;
			var trendX = trendSpark.width/5;
			if (trend) {
				
				svg.append('g')
					.attr("transform", "translate( " + [trendX, trendY] + ")")
					.append("path")
					.attr("d", d3.svg.symbol().type("triangle-up")())
					//.attr("filter","url(#omega3-dropshadow-1)")
					.attr("fill", trendSpark.success )
					.attr("transform", "scale(2)")
			} else {
				svg.append('g')
					.attr("transform", "translate( " + [trendX, trendY] + ")")
					.append("path")
					.attr("d", d3.svg.symbol().type("triangle-down")())
					//.attr("filter","url(#omega3-dropshadow-1)")
					.attr("fill", trendSpark.fail)
					.attr("transform", "scale(2)")
			}

			svg.append("text")
				.attr("dx", trendSpark.width - trendSpark.width/2)
				.attr("dy", trendSpark.height/3 + 20)
				.attr("font-size", "30px")
				.text(trendSpark.yFormat(trendSpark.yAccessor(secondLastValue)))

			svg.append("text")
				.attr("dx", trendSpark.width/2)
				.attr("dy", trendSpark.height/4 - 20)
				.attr("font-size", "30px")
				.attr("text-anchor", "middle")
				.text(trendSpark.yTitle || trendSpark.yColumn)

		}

		return trendSpark;
	};

	omega3.scatter = function(jsonData) {
		var scatter = new omega3.baseChart(jsonData);
		//var scatter = {};
		scatter.chartClass = "omega3-scatter";
		scatter.data = jsonData;
		scatter.nodes = [];
		scatter.bindingSelector = "body";
		scatter.width = 200;
		scatter.height = 400;

		scatter.radius = 8;
		
		scatter.colourFunction = null;
		scatter.axisPaddingPercent = 0.05;
		scatter.circles = null;

		scatter.force = null;
		scatter.gravity = 0;
		scatter.charge = -20;
		scatter.chargeDistance = 40;

		
		scatter.radiusRange = null;
		

		scatter.yFormat = d3.format(",.2f");
		scatter.xFormat = function (d) {return isNaN(+d) ? d : d3.format(",.2f")(d)};

	
		scatter.radiusValue = function (radiusColumn) {
			scatter.radiusColumn = radiusColumn;
			scatter.radiusAccessor = function (d) { return d[radiusColumn]};
			return this;
		}

		

		

		scatter.customAxis = function(g) {
		  g.selectAll("text")
			  .attr("x", 4)
			  .attr("dy", -4);
		};

		scatter.setColourFunction = function (colourFunction) {
			scatter.colourFunction = colourFunction;
			return this;
		}

		scatter.getWidth = function() {
			return scatter.width;
		};

		scatter.getHeight = function() {
			return scatter.height;
		}

		scatter.collide = function(node) {
		 var r = node.radius + 16,
			 nx1 = node.x - r,
			 nx2 = node.x + r,
			 ny1 = node.y - r,
			 ny2 = node.y + r;
		 return function(quad, x1, y1, x2, y2) {
		   if (quad.point && (quad.point !== node)) {
			 var x = node.x - quad.point.x,
				 y = node.y - quad.point.y,
				 l = Math.sqrt(x * x + y * y),
				 r = node.radius + quad.point.radius;
			 if (l < r) {
			   l = (l - r) / l * .5;
			   node.x -= x *= l;
			   node.y -= y *= l;
			   quad.point.x += x;
			   quad.point.y += y;
			 }
		   }
		   return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		 };
		}

		scatter.tick = function(e) {
			//var scatter = this;
			var k = .1 * e.alpha;

			var yTarget = function (d) { return 0; };
			var xTarget = function (d) { return 0; };
			if (scatter.xRange) {
				xTarget = function (d) { return (scatter.xRange(scatter.xAccessor(d)) - d.x) * k;};
			}

			if (scatter.yRange) {
				yTarget = function (d) { return (scatter.yRange(scatter.yAccessor(d)) - d.y) * k;};
			}

			// Push nodes toward their designated focus.
			scatter.nodes.forEach(function(d, i) {
				if (d.x <= d.radius + scatter.padding) {
					d.x = d.radius + scatter.padding;
				} else if (d.x >= scatter.getWidth() - d.radius) {
					d.x = scatter.getWidth() - d.radius - 1;
				}

				if (d.y <= d.radius ) {
					d.y = d.radius ;
				} else if (d.y >= scatter.getHeight() - d.radius) {
					d.y = scatter.getHeight() -  d.radius;
				}

				d.x += xTarget(d);
				d.y += yTarget(d);
			});

			var q = d3.geom.quadtree(scatter.nodes),
				 i = 0,
				 n = scatter.nodes.length;

			while (++i < n) q.visit(scatter.collide(scatter.nodes[i]));

			scatter.circles
			 .attr("cx", function(d) { return d.x })
			 .attr("cy", function(d) { return d.y});

		   //scatter.force.start();
		};

		scatter.resize = function() {
			scatter.init(true);
		};

		scatter.init = function(resize) {

			if (!(scatter.yAccessor && scatter.xAccessor)) {
				throw "Mandatory values not set. All values must be set (yAxisValue, xAxisValue)";
			}

			//var scatter = this;
			if (!resize)
				d3.select(scatter.bindingSelector + ' svg').remove();
				d3.select(scatter.bindingSelector + ' .omega3-extras').remove();

			if (!scatter.customSize) {
				var existingWidth = d3.select(scatter.bindingSelector).node().clientWidth;
				scatter.width = scatter.width < existingWidth || resize ? existingWidth : scatter.width;
			}

			var svg;
			if (resize) {
				svg = d3.select(scatter.bindingSelector + ' svg')
						.attr("width", scatter.width )
						.attr("height", scatter.height );
			} else {
				svg = d3.select(scatter.bindingSelector)
						.append('svg')
						.classed(omega3.baseClass, true)
						.classed(scatter.chartClass, true)
						.attr("width", scatter.width )
						.attr("height", scatter.height )
						.call(omega3.addShadowDef);

			}
			
			if (scatter.showLegend) {
				scatter.width -= scatter.legendArea;
			}

			scatter.force = d3.layout.force()
					   .nodes(scatter.nodes)
					   .links([])
					   .gravity(scatter.gravity)
					   .charge(scatter.charge)
					   .friction(0.95)
					   .chargeDistance(scatter.chargeDistance)
					   .size([scatter.width - (scatter.padding*2), scatter.height - (scatter.padding*2)])
					   .on("tick", scatter.tick);
			
			if (!scatter.radiusAccessor) {
				scatter.radiusAccessor = function () {return scatter.radius};		
			} 
			
			scatter.radiusRange = d3.scale
					.linear()
					.domain(
						[
							d3.min(scatter.data, scatter.radiusAccessor),
							d3.max(scatter.data, scatter.radiusAccessor)
						]
					)
					.range([8, 30]);

			scatter.xType;
			scatter.yType;

			if (!resize) {
				scatter.xType = 'linear';
				scatter.yType = 'linear';
				scatter.data.forEach(function (row, i) {
					var node = omega3.clone(row);
					node.radius = scatter.radiusRange(scatter.radiusAccessor(row));
					scatter.nodes.push(node);

					if (scatter.xAccessor) {
						var xNumberTest = +scatter.xAccessor(row);
						if(isNaN(xNumberTest)) {
							scatter.xType = 'ordinal';
						}
					}

					var yNumberTest = +scatter.yAccessor(row);
					if(isNaN(yNumberTest)) {
						scatter.yType = 'ordinal';
					}
				});
			}
			

			if (scatter.xAccessor) {

				if (scatter.xType == 'ordinal') {
					var ordinalValues = scatter.data.map(scatter.xAccessor);
					scatter.xRange = d3.scale
						.ordinal()
						.domain(scatter.data.map(scatter.xAccessor))
						.rangePoints([scatter.padding, scatter.width - scatter.padding],5);

					scatter.xAxis = d3
						.svg
						.axis()
						.scale(scatter.xRange)
						.tickValues(scatter.data.map(scatter.xAccessor).filter(
							function (d,i) {
								return !(i % 6);
							}))
						.orient("bottom");

				} else {
					
					var axisEnd = Math.max(1,d3.max(scatter.data, scatter.xAccessor)) * (1+scatter.axisPaddingPercent);
					scatter.xRange = d3.scale
						.linear()
						.domain(
							[
								axisEnd * -1,
								axisEnd
							]
						)
						.range([scatter.padding, scatter.width - scatter.padding]);

					scatter.xAxis = d3
						.svg
						.axis()
						.scale(scatter.xRange)
						.ticks(6)
						.orient("bottom");
				}
				
				

				if (scatter.xFormat) {
					scatter.xAxis.tickFormat(scatter.xFormat);
				} else {
					scatter.xFormat = function (d) { return d; };
				}
			}

			if (scatter.colourFunction) {
				scatter.colourRange = d3.scale
						.ordinal()
						.domain(scatter.data.map(scatter.colourFunction))
						.range(scatter.colours);
			}

			if (scatter.yType == 'ordinal') {
				scatter.yRange = d3.scale
					.ordinal()
					.domain(scatter.data.map(scatter.yAccessor))
					.rangePoints([scatter.height-scatter.padding, scatter.padding],5);

				if (!scatter.colourFunction) {
					scatter.colourRange = d3.scale
						.ordinal()
						.domain(scatter.data.map(scatter.yAccessor))
						.range(scatter.colours);
				}

			} else {
				var minValue = Math.min(1,d3.min(scatter.data, scatter.yAccessor));
				var maxValue = Math.max(1,d3.max(scatter.data, scatter.yAccessor));
				var axisEnd = Math.max(Math.abs(minValue), Math.abs(maxValue)) * (1+scatter.axisPaddingPercent);

				scatter.yRange = d3.scale
					.linear()
					.domain(
						[
							axisEnd*-1,
							axisEnd
						]
					)
					.range([scatter.height-scatter.padding, scatter.padding]);

				var colourBucketSize = (maxValue - minValue) / scatter.colours.length;
				var colourBuckets = [];
				var colourBucketNames = [];

				scatter.colours.forEach(function(d,i) {
					var bucketValue = minValue + colourBucketSize*i;
					colourBuckets.push(bucketValue);
					colourBucketNames.push("Above " + bucketValue );
				})

				

				if (!scatter.colourFunction && scatter.bucketColours) {
					scatter.colourFunction = function (d) {
						var yValue = scatter.yAccessor(d);
						for (bucketKey in colourBuckets) {
							var bucketValue = colourBuckets[bucketKey];
							if (yValue >= bucketValue && yValue <= bucketValue + colourBucketSize) {
								return "Above " + bucketValue ;//+ " and " + (bucketValue + colourBucketSize);
							}
						}

						return "Unknown Value";
					};
					scatter.legendPosition = function (d) {
						var yValue = scatter.yAccessor(d);
						for (bucketKey in colourBuckets) {
							var bucketValue = colourBuckets[bucketKey];
							if (yValue >= bucketValue && yValue <= bucketValue + colourBucketSize) {
								return +bucketKey;
							}
						}

						return -1;
					};

					scatter.colourRange = d3.scale
						.ordinal()
						.domain(
							colourBucketNames
						)
						.range(scatter.colours);

				} else if (!scatter.colourFunction) {
					scatter.colourFunction = function (d) { return scatter.yColumn; };
					scatter.legendPosition = function (d) { return 0; };
					scatter.colourRange = d3.scale
						.ordinal()
						.domain(
							[scatter.yColumn]
						)
						.range(scatter.colours);
				} else {

				}

				
			}

			scatter.yAxis = d3
					.svg
					.axis()
					.scale(scatter.yRange)
					.ticks(4)
					.orient("right");



			if (scatter.yFormat) {
				scatter.yAxis.tickFormat(scatter.yFormat);
			} else {
				scatter.yFormat = function (d) { return d; }
			}

			if (!scatter.colourFunction) {
				scatter.colourFunction = function(d) {
					return scatter.colourRange(scatter.yAccessor(d))
				};
			} 

			if (!scatter.legendFunction) {
				scatter.legendFunction = scatter.colourFunction;
			}

			if (scatter.tooltipFunctions.length == 0) {
				scatter.tooltipFunctions.push({
					title:(scatter.yTitle || scatter.yColumn),
					contentFunction: function (d) {return scatter.yFormat(scatter.yAccessor(d));}
				})	

				scatter.tooltipFunctions.push({
					title:(scatter.xTitle || scatter.xColumn),
					contentFunction: function (d) {return scatter.xFormat(scatter.xAccessor(d));}
				})	

				if (scatter.radiusColumn) {
					scatter.tooltipFunctions.push({
						title:(scatter.radiusTitle || scatter.radiusColumn),
						contentFunction: function (d) {return scatter.radiusAccessor(d);}
					})	
				}	
			}
					

			var tooltip = omega3.tooltip(scatter.tooltipFunctions, scatter.tooltipHeader);
			var drag = omega3.drag(scatter.force, scatter.tick);

			var yAvg = d3.mean(scatter.data, scatter.yAccessor);

			scatter.circles = svg
				.selectAll('circle')
				.data(scatter.nodes);

			scatter.circles
				.enter()
				.append('circle')
				.attr("class", "omega3-data-point")
				.attr("cx", function(d) { return Math.random() * scatter.width; })
				.attr("cy", function(d) { return Math.random() * scatter.height; })
				.attr("fill", function(d) { return scatter.colourRange(scatter.colourFunction(d))})
				.attr('r', function(d) {return 0;})
				.attr("omega3-legend-data", scatter.legendFunction)
				.attr("omega3-legend-pos", function (d) { if (scatter.legendPosition) { return scatter.legendPosition(d); } else { return 0; }})
				
				.call(tooltip)
				//.call(omega3.circleHover)
				//.call(scatter.force.drag)
				.call(scatter.force.drag)
				.transition()
				.delay(function(d,i) { return i * 25; })
				.ease("linear")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr('r', function(d) {return scatter.radiusRange(scatter.radiusAccessor(d));})
				;
			
			if (scatter.xAxis) {
				svg.select("g.x.axis").remove();
				// Add the x-axis.
				svg.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(" + 0 + "," + (scatter.height/2) + ")")
				  .call(scatter.xAxis);
			}
			

			svg.select("g.y.axis").remove();
			// Add the y-axis.
			svg.append("g")
			  .attr("class", "y axis")
			  .attr("transform", "translate(" + scatter.width/2 + ",0)")
			  .call(scatter.yAxis)
			  //.call(scatter.customAxis);
			
			svg.selectAll(".tick")
				.each(function (d) {
					if ( d === 0 ) {
						this.remove();
					}
				});

			scatter.force.start();

			if (!scatter.hideSearch) {
				omega3.addSearch(scatter.bindingSelector,
								[scatter.circles], 
								-scatter.padding - 30, 
								scatter.width + 5, 
								scatter.legendArea - 25)
			}

			if (scatter.showLegend && scatter.legendFunction) {
				omega3.legend(svg, scatter.allowSearch, scatter.legendArea);
			}

			d3.select(window).on("resize", scatter.resize);

			return this;
		};

		return scatter;
	};

	this.omega3 = omega3;
	this.Ω3 = omega3;
}();