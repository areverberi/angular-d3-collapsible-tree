 /* jslint node: true */
 /* global angular, $, d3 */
 'use strict';

 var app = angular.module( 'renderteam.collapsibleTree', [] );
 app.directive( 'collapsibleTree', collapsibleTree );

 collapsibleTree.$inject = [];

 function collapsibleTree() {
 	return {
 		restrict: 'E',
 		scope: {
 			width: '=',
 			height: '=',
 			radius: '=',
 			nodes: '=',
 			onNodeClick: '&',
 		},
 		link: function( scope, element ) {
 			var m = [ 20, 120, 20, 120 ],
 				w = 1280 - m[ 1 ] - m[ 3 ],
 				h = 800 - m[ 0 ] - m[ 2 ],
 				i = 0,
 				root;
 			var radius = 18;

 			var tree = d3.layout.tree()
 				.size( [ h, w ] );

 			var diagonal = d3.svg.diagonal()
 				.projection( function( d ) {
 					return [ d.y, d.x ];
 				} );

 			var vis = d3.select( "collapsible-tree" ).append( "svg:svg" )
 				.attr( "width", w + m[ 1 ] + m[ 3 ] )
 				.attr( "height", h + m[ 0 ] + m[ 2 ] )
 				.append( "svg:g" )
 				.attr( "transform", "translate(" + m[ 3 ] + "," + m[ 0 ] + ")" );


 			scope.$watch( 'nodes', function() {

 				function toggleAll( d ) {
 					if ( d.children ) {
 						d.children.forEach( toggleAll );
 						toggle( d );
 					}
 				}
 				if ( scope.nodes ) {
 					root = angular.copy( scope.nodes );
 					root.x0 = h / 2;
 					root.y0 = 0;

 					// Initialize the display to show a few nodes.
 					if ( root.children ) {
 						root.children.forEach( toggleAll );
 					}


 					update( root );
 				}
 			}, true );

 			function update( source ) {
 				var duration = d3.event && d3.event.altKey ? 5000 : 500;

 				// Compute the new tree layout.
 				var nodes = tree.nodes( root ).reverse();

 				// Normalize for fixed-depth.
 				nodes.forEach( function( d ) {
 					d.y = d.depth * 180;
 				} );

 				// Update the nodes
 				var node = vis.selectAll( "g.node" )
 					.data( nodes, function( d ) {
 						return d.id || ( d.id = ++i );
 					} );

 				// Enter any new nodes at the parent's previous position.
 				var nodeEnter = node.enter().append( "svg:g" )
 					.attr( "class", "node" )
 					.attr( "transform", function( d ) {
 						return "translate(" + source.y0 + "," + source.x0 + ")";
 					} )
 					.on( "click", function( d ) {

 						toggle( d );
 						if ( scope.onNodeClick ) {
 							scope.onNodeClick( {
 								'id': d.id
 							} );
 						}
 						update( d );
 					} );

 				nodeEnter.append( "svg:circle" )
 					.attr( "r", 1e-5 )
 					.style( "fill", function( d ) {
 						return d._children ? "lightsteelblue" : "#fff";
 					} );

 				nodeEnter.append( "svg:text" )
 					.attr( "dy", "" + ( radius * 2 + 10 ) )
 					.attr( "text-anchor", function( d ) {
 						return "middle";
 					} )
 					.text( function( d ) {
 						return d.name;
 					} )
 					.style( "fill-opacity", 1e-5 );

 				// Transition nodes to their new position.
 				var nodeUpdate = node.transition()
 					.duration( duration )
 					.attr( "transform", function( d ) {
 						return "translate(" + d.y + "," + d.x + ")";
 					} );

 				nodeUpdate.select( "circle" )
 					.attr( "r", radius )
 					.style( "fill", function( d ) {
 						return d._children ? "lightsteelblue" : "#fff";
 					} );

 				nodeUpdate.select( "text" )
 					.style( "fill-opacity", 1 );

 				// Transition exiting nodes to the parent's new position.
 				var nodeExit = node.exit().transition()
 					.duration( duration )
 					.attr( "transform", function( d ) {
 						return "translate(" + source.y + "," + source.x + ")";
 					} )
 					.remove();

 				nodeExit.select( "circle" )
 					.attr( "r", 1e-6 );

 				nodeExit.select( "text" )
 					.style( "fill-opacity", 1e-6 );

 				// Update the links
 				var link = vis.selectAll( "path.link" )
 					.data( tree.links( nodes ), function( d ) {
 						return d.target.id;
 					} );

 				// Enter any new links at the parent's previous position.
 				link.enter().insert( "svg:path", "g" )
 					.attr( "class", "link" )
 					.attr( "d", function( d ) {
 						var o = {
 							x: source.x0,
 							y: source.y0
 						};
 						return diagonal( {
 							source: o,
 							target: o
 						} );
 					} )
 					.transition()
 					.duration( duration )
 					.attr( "d", diagonal );

 				// Transition links to their new position.
 				link.transition()
 					.duration( duration )
 					.attr( "d", diagonal );

 				// Transition exiting nodes to the parent's new position.
 				link.exit().transition()
 					.duration( duration )
 					.attr( "d", function( d ) {
 						var o = {
 							x: source.x,
 							y: source.y
 						};
 						return diagonal( {
 							source: o,
 							target: o
 						} );
 					} )
 					.remove();

 				// Stash the old positions for transition.
 				nodes.forEach( function( d ) {
 					d.x0 = d.x;
 					d.y0 = d.y;
 				} );
 			}

 			// Toggle children.
 			function toggle( d ) {
 				if ( d.children ) {
 					d._children = d.children;
 					d.children = null;
 				} else {
 					d.children = d._children;
 					d._children = null;
 				}
 			}

 		}

 	};
 }
