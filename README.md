
#READ ME

This project is a simple bar chart using d3js with a jquery plugin. You
instantiate the barchar in the same fashion as any jquery plugin. The only
dependencies for this project are d3js and jquery.


<div id="mybarchart"> </div>

$("#mybarchart").mbarchart(options)


STYLING:

The barchart plugin will add classes to each html element it creates. These
classes will allow you to style the calendar via css.

classes:

mbarchat        : wrapper around the entire barchart
mtooltip        : wrapper around the tooltip element
bar             : the bars
hover           : hover state for a bar
axis-label      : on both labels x and y axis
y-axis-label    : the label for the y axis (use this to set the font-size)
x-axis-label    : the label for the x axis (use this to set the font-size)
series-N        : where N in an integer from 0 to X. This label is when the graph
                  is in stacked mode. For each series in the data being passed in, we can
                  specify the bar color

mbarchart-legend : the container for the legend. The legend is positioned absolutely, so use top, right, left, etc
                   to position it in the desired spot
series-box       : the box representing each data series. The number of these boxes should match the number of
                   data series you passed in
mbarchart-legend-label : main label for the legend



Options:

This mbarchart was built to be data agnostic, meaning that the data it displays
in the view can be arbitrary. Use these parameters to set up the calendar plugin.

    A) data
    B) labels
    C) dimensions
    D) margins
    E) axis
    F) events
    G) meta
    H) tooltip
    I) accessors
    J) legend


A) data (required)

This will be the data displayed in the bar chart. It will be an array of objects or an array of arrays. Each data point
must have at least two values (one representing data for the x axis, one for the y-axis)

E.G - 1: data = [{_groupby: XX, _count: YY}, {_groupby: XX, _count: YY}, {_groupby: XX, _count: YY}]

Represents a normal bar chart with a single series of data

E.G - 2: data = [[{_groupby: 1, _count: 123}, {_groupby: 2, _count: 564}, {_groupby: 3, _count: 234}],
                 [{_groupby: 1, _count: 233}, {_groupby: 2, _count: 234}, {_groupby: 3, _count: 567}],
                 [{_groupby: 1, _count: 563}, {_groupby: 2, _count: 864}, {_groupby: 3, _count: 366}]]

Represents data for "stacked" bar chart. In the data array, we see three seperate series being passed in. Each
element in the series correlates to the X values of other series elements by index in the array.

values: array[objects] or array[array[objects], array[objects], array[objects]]


B) labels - (optional)

This parameter is a json object used to specify the labels for each axis of chart. This object along with each of the
parameters in the object are optional. You can pass it in, in full, or in part.


values: {ylabel: string, //this will be display on the side of the yaxis
         ypadding: int,  //use this value to position the label further or closer to the yaxis
         xlabel: string  //this string will be displayed under the xaxis
         xpadding: int, //use this to position the label further or closer to the xaxis
         }

C) dimensions - (optional)

This parameter tells the barchart what size to render at. Use this if
you want to explicitly set the dimensions of the chart. If you do NOT
set this parameter the calendar will default to the size of the containing
element for the calendar. NOTE: there are default minimums for each view.


values: {width: XXX, height: YYYY}
default: size of containing element (if you want to set the size via css and not js)

Default min dimensions are:  {width: 600, height: 300}



D) margins - (optional)

This parameter is used to safely set the margins of each bar chart inside the dimensions of it's parent container.
If you use this property, the bar chart will always be spaced correctly to fit within the "dimensions" you specified.

value: {t:int, r:int, b:int, l:int} pass ints in to determine the pixel values of the margins.
default: {t:0, r:0, b:0, l:0}


example: {t: 5, r:5, b:20, l:5}

This will create top, right, left margins of 5px, and a bottom margin of 20px. This can be used when you want
to place the month label at the bottom of the calendar


E) axis - (optional)

Use this parameter to rotate the text of the x axis. When there are a lot of elements you are charting there
will be problems trying to label each tick on the axis. This can be used to rotate the text either
horizontally (default), angled, or vertically

values: { x : { rotateText: string,
                xoffset   : int,   //position the text left or right of the xaxis tick
                yoffset   : int    //position the text above or below the xaxis tick
                }}

where the string is either "vertical", "angled", or "horizontal".



F) events - (optional)

The chart plugin will respond to two events. You can pass in callback functions
for each event. For each event, the calendar will pass in a json object.

value: {onclick: function (d, i) {//do stuff}, onmouseover: function (d,i) {//do stuff}}
default:  {onclick: $.noop, onmouseover: $.noop}

The parameter passed into to each callback is

d = {
    data: object, //this is the element passed in as a data array
    meta: user specified //the calendar will pass back exactly what was passed in
                         //as the meta parameter
}

i = index of the bar you hovered over


G) meta - (optional)

This is a pass through parameter. Whatever you pass in here, will be given back to you in the callback


H) tooltip - (optional)

display a tooltip of the data used charted as the x,y coordinates of the chart


I) accessors - (optional)

This is javascript object which contains two functions. The functions tell the chart
plugin how to access the date field, and the count field within the data object. Use
parameter if your data array contains a javascript object that doesn't have the fields
_x or _y.


value: {getX: function (d) { return d.fieldContainingXCoord,
        getY: function (d) { return d.fieldContainingYCoord}}

default: {getTimestamp: function (d) {return d._x,
          getCount: function (d) { return d._y}}

E.G: if your data array contains objects like data = [{_groupby:XX, _count:XX}]

then accessors: {getTimestamp: function (d) { return d._groupby,
                 getCount: function (d) { return d._count}}



J) legend - (optional)

If you want a legend to be created use this parameter. The legend will can be styled via css, position, size
and colours are all configurable.

 legend:{
            label: "Histogram Legend",       //the label for the entire legend
            serieslabels: ["first", "second", "third"]  // the label for each series
            },



Code Examples:


see the code in the examples folder

