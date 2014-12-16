!function() {
	var omega3 = {
		version: "0.1"
	};

	if (typeof(d3) == "undefined") {
		throw "d3 is not defined. This library is required.";
	};

	omega3.baseClass = "omega3"

	omega3.legend = function (g) {
		var defaultShape = 'rect';
		g.each(function() {
		    var g= d3.select(this),
		        items = {},
		        svg = d3.select(g.property("nearestViewportElement")),
		        legendPadding = g.attr("data-style-padding") || 20,
		        lb = g.selectAll(".omega3-legend-box").data([true]),
		        li = g.selectAll(".omega3-legend-items").data([true])
		 
		    lb.enter().append("rect").classed("omega3-legend-box",true)
		    li.enter().append("g").classed("omega3-legend-items",true)
		 
		    svg.selectAll("[omega3-legend-data]").each(function() {
		        var self = d3.select(this)
		        items[self.attr("omega3-legend-data")] = {
		          pos : self.attr("omega3-legend-pos") || this.getBBox().y,
		          color : self.attr("omega3-legend-color") != undefined ? self.attr("omega3-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke"),
		          shape : self.attr("omega3-legend-shape") || defaultShape
		        }
		      })
		 
		    items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})
		 	
		 	var sele

		 	var highlightRecord = [];
		    
		    var mouseover = function (d) {
		    	highlightRecord = [];
	        	d3.selectAll("[omega3-legend-data]").each(function(){
	        		
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
			//.attr("role", "form")
			.style("position", "relative")
			.style("top", top || 0)
			.style("left", left || 0)
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

	omega3.scatter = function(jsonData) {
		var scatter = {};
		scatter.chartClass = "omega3-scatter";
		scatter.data = jsonData;
		scatter.nodes = [];
		scatter.bindingSelector = "body";
		scatter.width = 200;
		scatter.height = 400;
		scatter.customSize = false;
		scatter.padding = 30;
		scatter.radius = 8;
		scatter.colours = omega3.colours();
		scatter.showLegend = true;
		scatter.colourFunction = null;
		scatter.axisPaddingPercent = 0.05;
		scatter.circles = null;
		scatter.legendArea = 150;

		scatter.force = null;
		scatter.gravity = 0;
		scatter.charge = -20;
		scatter.chargeDistance = 40;

		scatter.xAccessor = null;
		scatter.yAccessor = null;
		scatter.radiusAccessor = null;
		scatter.xAxis = null;
		scatter.yAxis = null;
		scatter.xRange = null;
		scatter.yRange = null;
		scatter.radiusRange = null;
		scatter.legendFunction = null;

		scatter.yFormat = d3.format(",.2f");
		scatter.xFormat = d3.format(",.2f");

		scatter.setBinding = function (selector) {
			scatter.bindingSelector = selector;
			return this;
		};

		scatter.xAxisValue = function (xAccessor) {
			scatter.xAccessor = function (d) { return d[xAccessor]};
			return this;
		};

		scatter.yAxisValue = function (yAccessor) {
			scatter.yAccessor = function (d) { return d[yAccessor]};
			return this;
		};

		scatter.radiusValue = function (radiusAccessor) {
			scatter.radiusAccessor = function (d) { return d[radiusAccessor]};
			return this;
		}

		scatter.setXFormat = function (formatFunction) {
			scatter.xFormat = formatFunction;
			return this;
		};

		scatter.setYFormat = function (formatFunction) {
			scatter.yFormat = formatFunction;
			return this;
		};

		scatter.setYTitle = function (titleString) {
			scatter.yTitle = titleString;
			return this;
		};

		scatter.setXTitle = function (titleString) {
			scatter.xTitle = titleString;
			return this;
		};

		scatter.setTooltipHeaderValue = function(headerAccessor) {
			scatter.tooltipHeader = function (d) { return d[headerAccessor]; }
			return this;
		};

		scatter.setCustomLegendFunction = function (legendFunction) {
			scatter.legendFunction = legendFunction;
			return this;
		};

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
						.attr("height", scatter.height );
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
			
			var xType = 'linear';
			var yType = 'linear';

			if (scatter.xAccessor) {

				if (xType == 'ordinal') {
					scatter.xRange = d3.scale
						.ordinal()
						.domain(scatter.data.map(scatter.xAccessor))
						.rangePoints([scatter.padding, scatter.width - scatter.padding],5);
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
				}
				
				scatter.xAxis = d3
					.svg
					.axis()
					.scale(scatter.xRange)
					.tickPadding(10)
					.orient("bottom");

				if (scatter.xFormat) {
		    		scatter.xAxis.tickFormat(scatter.xFormat);
		    	} else {
		    		scatter.xFormat = function (d) { return d; };
		    	}
			}

			if (yType == 'ordinal') {
				scatter.yRange = d3.scale
					.ordinal()
					.domain(scatter.data.map(scatter.yAccessor))
					.rangePoints([scatter.height-scatter.padding, scatter.padding],5);

				scatter.colourRange = d3.scale
	    			.ordinal()
					.domain(scatter.data.map(scatter.yAccessor))
					.range(scatter.colours);
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

				

				if (!scatter.colourFunction) {
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
				}

				scatter.colourRange = d3.scale
	    			.ordinal()
	    			.domain(
						colourBucketNames
					)
					.range(scatter.colours);
			}

			if (!scatter.radiusAccessor) {
				scatter.radiusAccessor = function () {return scatter.radius};		
			} else {
				
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

			if (!resize) {
				scatter.data.forEach(function (row, i) {
					var node = omega3.clone(row);
					node.radius = scatter.radiusRange(scatter.radiusAccessor(row));
					scatter.nodes.push(node);

					if (scatter.xAccessor) {
						var xNumberTest = +scatter.xAccessor(row);
						if(isNaN(xNumberTest)) {
							xType = 'ordinal';
						}
					}

					var yNumberTest = +scatter.yAccessor(row);
					if(isNaN(yNumberTest)) {
						yType = 'ordinal';
					}
				});
			}
			


			

	    	var yAvg = d3.mean(scatter.data, scatter.yAccessor);

	    	scatter.circles = svg
				.selectAll('circle')
				.data(scatter.nodes);

			scatter.circles
				.enter()
				.append('circle')
				.attr("class", "node")
		        .attr("cx", function(d) { return Math.random() * scatter.width; })
		        .attr("cy", function(d) { return Math.random() * scatter.height; })
				.attr("fill", function(d) { return scatter.colourRange(scatter.colourFunction(d))})
				.attr('r', function(d) {return 0;})
				.attr("omega3-legend-data", scatter.legendFunction)
				.attr("omega3-legend-pos", function (d) { if (scatter.legendPosition) { return scatter.legendPosition(d); } else { return 0; }})
				.call(scatter.force.drag)
				.transition()
				.delay(function(d,i) { return i * 25; })
				.ease("linear")
				.attr("cx", function(d) { return d.x; })
		        .attr("cy", function(d) { return d.y; })
		        .attr('r', function(d) {return scatter.radiusRange(scatter.radiusAccessor(d));})
				;

			scatter.circles
				.on("mouseover",function(d,i) { 
		          var el = d3.select(this)
		          
		          el.style("stroke","#AFAFAF").style("stroke-width",3);
		          var parentWidth;
		          if (this.parentNode.width && this.parentNode.width.baseVal && this.parentNode.width.baseVal.value) {
		          	parentWidth = this.parentNode.width.baseVal.value;
		          }
		          var tooltipWidth = 200;
		          var tooltipHeight = 90;
		          var textSpacing = 18;
		          var lines = 0;
		          var xCoord = +el.attr('cx') - tooltipWidth/2;
		          var yCoord = +el.attr('cy') - d.radius - tooltipHeight - 5;
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
		          		.style("border-radius", "10px")
		          		.attr("opacity", 0.9);

		          if (scatter.tooltipHeader) {
		          	tooltip.append("text")
		          			.attr("color", "black")
		          			.attr("class", "omega3-tooltip-header")
		          			.attr("y", (textSpacing * lines++) + 30)
		          			.attr("x", 30)
		          			.text(scatter.tooltipHeader(d))
		          }
		          var yTitle = "Y: ";
		          var xTitle = "X: ";
		          if (scatter.yTitle) {
		          	yTitle = scatter.yTitle + ": ";
		          }
		          if (scatter.xTitle) {
		          	xTitle = scatter.xTitle + ": ";
		          }

				  tooltip.append("text")
				  		.attr("color", "black")
				  		.attr("x", 30)
				  		.attr("y", (textSpacing * lines++) + 30)
				  		.text(xTitle + scatter.xFormat(scatter.xAccessor(d)));

				  tooltip.append("text")
				  		.attr("color", "black")
				  		.attr("x", 30)
				  		.attr("y", (textSpacing * lines++) + 30)
				  		.text(yTitle + scatter.yFormat(scatter.yAccessor(d)));
		          
		          })
		        .on("mouseout",function(d,i) { 
		          d3.select(this)
		          .style("stroke-width",0)
		          //.style("stroke", function(d){ return that.getStrokeColor(d); })
		          d3.selectAll(".omega3-tooltip").remove()
		      	})
			
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
					 			-scatter.padding - 20, 
					 			scatter.width + 10, 
					 			scatter.legendArea - 25)
			}

			if (scatter.showLegend && scatter.legendFunction) {
				svg.select(".omega3-legend").remove();
				legend = svg.append("g")
					  .attr("class","omega3-legend")
					  .attr("transform","translate(" + (scatter.width + 10) + ", " + (scatter.height - 300) + ")")
					  .style("font-size","12px")
					  .call(omega3.legend);
			}

			d3.select(window).on("resize", scatter.resize);

	    	return this;
		};

		return scatter;
	};

	this.omega3 = omega3;
	this.Ω3 = omega3;
}();