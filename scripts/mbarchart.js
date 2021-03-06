

(function( $ ){

    var MBAR_CLASS           = "mbarchart",
        MBAR_LABEL           = "mbarchart-label",
        MBAR_HTML            = "<div class='" + MBAR_CLASS + "'> </div> <div class='" + MBAR_LABEL + " label-main'> </div>",
        MIN_M_DIMENSIONS     = {width: 600, height: 300},
        DEFAULT_MARGIN       = {top: 20, right: 20, bottom: 30, left: 30},
        LABEL_MARGIN_OFFSET  = {left: 20, bottom:20, top: 20},
        Barchart;

    /**
     * ensure the dimensions don't have a width and height smaller than the default
     * specified in the fallback object
     * @param dimensions
     * @param fallback
     * @return {Object}
     * @private
     */
    function calcDimensions (dimensions, fallback) {

        var tmpWidth   = dimensions.width < fallback.width ? fallback.width : dimensions.width,
            tmpHeight  = dimensions.height < fallback.height ? fallback.height : dimensions.height,
            dimensions = {width: tmpWidth, height: tmpHeight, autoGrow: dimensions.autoGrow};

        return dimensions;
    };

    /**
     * Need to specify the margins of the chart. This takes into account the labels
     * passed in for each axis and the margins parameters
     * @param labels
     * @param pMargins
     */
    function calcMargins (labels, pMargins) {

        var margins = pMargins || {},
            xlabel  = !!(labels && labels.xlabel),
            ylabel  = !!(labels && labels.ylabel),
            mlabel  = !!(labels && labels.mainlabel),
            toRet   = jQuery.extend({}, DEFAULT_MARGIN);

        //If user passed in default margins, use those
        toRet.left   = margins.l || DEFAULT_MARGIN.left;
        toRet.right  = margins.r || DEFAULT_MARGIN.right;
        toRet.top    = margins.t || DEFAULT_MARGIN.top;
        toRet.bottom = margins.b || DEFAULT_MARGIN.bottom;

        //If user set labels add an offset to the margins
        toRet.left    = ylabel ? toRet.left   + LABEL_MARGIN_OFFSET.left   : toRet.left;
        toRet.bottom  = xlabel ? toRet.bottom + LABEL_MARGIN_OFFSET.bottom : toRet.bottom;
        toRet.top     = mlabel ? toRet.top    + LABEL_MARGIN_OFFSET.top    : toRet.top;

        return toRet;
    };

    /**
     * Check options parameter to see if user wants to rotate the axis text. We
     * allow either a 45 or 90 degree rotation
     *
     * @param pAxis
     * @return {Object}
     */
    function calAxisParams (pAxis) {

        var axis  = pAxis || {},
            toRet = {x:{}};

        axis.x    = axis.x || {};

        if (axis.x.rotateText === "angled") {

            toRet.x.rotation = -35;
            toRet.x.xoffset  = axis.x.xoffset || -10;
            toRet.x.yoffset  = axis.x.yoffset || 10;

        } else if (axis.x.rotateText === "vertical") {

            toRet.x.rotation = 90;
            toRet.x.xoffset  = axis.x.xoffset || 15;
            toRet.x.yoffset  = axis.x.yoffset ||25;
        }

        return toRet;
    };

    Barchart = function(options) {

        var self = this,
            opt  = options,
            default_dimensions,
            parent_el_dimensions;

        self.anchorSelector     = opt.rootSelector + " ." + MBAR_CLASS;
        self.$mainLabel         = $(opt.rootSelector + " .label-main");
        self.$root              = $(opt.rootSelector);

        default_dimensions   = MIN_M_DIMENSIONS;
        parent_el_dimensions = {width: self.$root.width(), height: self.$root.height()};

        self.dimensions  = opt.dimensions ?
                                calcDimensions(opt.dimensions, default_dimensions) :
                                calcDimensions(parent_el_dimensions, default_dimensions);

        self.margins    = calcMargins(opt.labels, opt.margins);
        self.labels     = opt.labels || {};
        self.axis       = calAxisParams(opt.axis);
        self.useTooltip    = !!opt.useTooltip;

        self.getX  = (opt.accessors && opt.accessors.getX) ?
                         opt.accessors.getX : function (d) {return d._x};

        self.getY  = (opt.accessors && opt.accessors.getY) ?
                         opt.accessors.getY : function (d) {return d._y};

        self.onclick    = (opt.events && opt.events.onclick) ?
                               opt.events.onclick : null;

        self.onmouseover = (opt.events && opt.events.onmouseover) ?
                                opt.events.onmouseover : null;

        self.meta  = opt.meta || {};
        self.data  = opt.data;

        self._createSvg();
        self._processAxis(self.data);
        self._drawBars();
    };

    /**
     * Generate the main svg container
     *
     * @private
     */
    Barchart.prototype._createSvg = function () {

        var self = this;

        self.svg = d3.select(self.anchorSelector)
                    .append("svg")
                    .attr("width", self.dimensions.width)
                    .attr("height", self.dimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + self.margins.left + "," + self.margins.top + ")")

        self.tooltip = d3.select(self.anchorSelector)
                    .append("div")
                    .attr("class", "mtooltip")
                    .style("opacity", 1e-6)
                    .style("position", "absolute")


        $(self.anchorSelector).on("mouseleave", function() {
            self.svg.selectAll(".bar").classed("hover", false);
        })

    };

    /**
     * Draw the axis, and the labels
     * @param data
     * @private
     */
    Barchart.prototype._processAxis = function (data) {

        var self   = this,
            width  = self.dimensions.width  - self.margins.left - self.margins.right,
            height = self.dimensions.height - self.margins.top  - self.margins.bottom,
            xRange = d3.scale.ordinal().rangeBands([0, width], 0.1, 0.3),
            yRange = d3.scale.linear().range([height, 0]),
            xAxis  = d3.svg.axis().scale(xRange).orient("bottom"),
            yAxis  = d3.svg.axis().scale(yRange).orient("left"),
            axisParam = self.axis,
            labels    = self.labels,
            padding;

        xRange.domain(data.map(self.getX));
        yRange.domain([0, d3.max(data, self.getY)]);

        self.xRange = xRange;
        self.yRange = yRange;
        self.height = height;

        //Define y-axis ------
        self.svg
            .append("g")
            .attr("class", "y-axis axis")
            .call(yAxis)

        //Define x-axis ------
        self.svg
            .append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //Rotate text on x-axis so -----
        //we can fit more
        if(axisParam.x.rotation) {

            self.svg
                .selectAll(".x-axis text")  // select all the text elements for the xaxis
                .attr("transform", function(d) {
                    return "translate(" + axisParam.x.xoffset + "," + axisParam.x.yoffset +
                        ")rotate(" + axisParam.x.rotation + ")";
                });
        }

        //Add the label for the y-axis --
        //if it was specified
        if (labels.ylabel) {

            padding = labels.ypadding || 0;
            self.svg
                .selectAll(".y-axis")
                .append("text")
                .attr("class", "y-axis-label axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "translate("+ -padding +","+(height/2)+")rotate(-90)")
                .text(labels.ylabel);
        }

        //Add the label for the x-axis --
        //if it was specified
        if (labels.xlabel) {

            padding = labels.xpadding || 0;
            self.svg
                .selectAll(".x-axis")
                .append("text")
                .attr("class", "x-axis-label axis-label")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate("+ (width/2) +","+ padding +")")  // centre below axis
                .text(labels.xlabel);
        }

    };

    Barchart.prototype._drawBars = function () {

        var self   = this,
            data   = self.data,
            height = self.height,
            x      = self.xRange,
            y      = self.yRange;

        function mouseover(d, i) {

            if(self.useTooltip) {
                self.svg.selectAll(".bar").classed("hover", false);
                this.classList.add("hover");

                self.tooltip.transition()
                    .duration(300)
                    .style("opacity", 1);
            }

            //call the passed in callback
            if(self.onmouseover){
                self.onmouseover(d,i);
            }
        }

        function mousemove(d, i) {

            self.tooltip
                .text("("+self.getX(d.data) + ", " + self.getY(d.data)+")")
                .style("left", (d3.event.pageX + 10 ) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        }

        function mouseout(d, i) {

            self.tooltip.transition()
                .duration(300)
                .style("opacity", 1e-6);
        }

        self.svg
            .append("g")
            .attr("class", "bars")
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(self.getX(d)); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(self.getY(d)); })
            .attr("height", function(d) { return height - y(self.getY(d)); })
            .datum(function(d) { return {data: d, meta: self.meta};})


        //For efficiency, only add event handlers if they are necessary
        if (self.onclick) {
            self.svg
                .selectAll(".bar")
                .on("click", self.onclick);
        }

        if (self.onmouseover || self.useTooltip) {
            self.svg
                .selectAll(".bar")
                .on("mouseover", mouseover)
        }

        if(self.useTooltip) {

            self.svg
                .selectAll(".bar")
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);
        }

    };

    var methods = {

        init : function(options) {

            var data = this.data(MBAR_CLASS),
                o    = options || {},
                obj;

            //Sanity Check: -----------------------------
            // Make sure they are calling init
            // on one element at a time
            if(this.length > 1) {
                console.error("Warning: you can only initialize one element at a time");
                return this;
            }

            //Sanity Check: -----------------------------
            // Make sure element isn't already a
            // calendar
            if(data && data.calendar) {
                console.error("Warning: this element has already been initialized as an mbarchart");
                return this;
            }

            //Sanity Check: -----------------------------
            // Make sure d3 exists
            if(!d3) {
                console.error("Warning: d3 library not loaded");
                return this;
            }

            //Sanity Check: -----------------------------
            // Make sure a data array was passed in
            if(!o.data) {

                console.error("Warning: A data array needs to be passed in");
                return this;
            }

            //Render base html wrapper
            this.html(MBAR_HTML);

            obj = new Barchart({rootSelector: this.selector,
                                useTooltip:o.tooltip,
                                data: o.data,
                                labels: o.labels,
                                margins: o.margins,
                                axis: o.axis,
                                dimensions: o.dimensions,
                                accessors: o.accessors,
                                meta:   o.meta,
                                events: o.events});

            $(this).data(MBAR_CLASS, { barchart : obj});

            return this;
        },

        reset : function () {

            return this;
        }

    };

    $.fn.mbarchart = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.mbarchar');
        }

    };

})( jQuery );
